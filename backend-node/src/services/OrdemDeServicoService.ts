
import prisma from '../prisma';
import { StatusOS } from '@prisma/client';
import { ClienteService } from './ClienteService';
import { TecnicoService } from './TecnicoService';
import { EquipamentoService } from './EquipamentoService';
import { MaterialService } from './MaterialService';

const clienteService = new ClienteService();
const tecnicoService = new TecnicoService();
const equipamentoService = new EquipamentoService();
const materialService = new MaterialService();

const OS_INCLUDE = {
  cliente: { include: { pessoa: true } },
  tecnico: { include: { pessoa: true } },
  equipamento: true,
  agendamento: true,
  itensMaterial: { include: { material: true } },
  checklist: true,
};

function mapOS(os: any) {
  return {
    id: os.id.toString(),
    cliente: os.cliente
      ? {
          id: os.cliente.id.toString(),
          nome: os.cliente.pessoa?.nome,
        }
      : null,
    tecnico: os.tecnico
      ? {
          id: os.tecnico.id.toString(),
          nome: os.tecnico.pessoa?.nome,
        }
      : null,
    equipamento: os.equipamento
      ? {
          ...os.equipamento,
          id: os.equipamento.id.toString(),
        }
      : null,
    agendamento: os.agendamento
      ? { id: os.agendamento.id.toString() }
      : null,
    dataAbertura: os.dataAbertura,
    dataConclusao: os.dataConclusao,
    status: os.status,
    diagnosticoTecnico: os.diagnosticoTecnico,
    valorMaoDeObra: os.valorMaoDeObra,
    valorTotal: os.valorTotal,
    itensMaterial: (os.itensMaterial || []).map((im: any) => ({
      id: im.id.toString(),
      material: im.material
        ? {
            id: im.material.id.toString(),
            descricao: im.material.descricao,
            precoUnitario: im.material.precoUnitario,
          }
        : null,
      quantidade: im.quantidade,
      precoUnitarioCobrado: im.precoUnitarioCobrado,
      valorTotalItem: im.quantidade * im.precoUnitarioCobrado,
    })),
    checklist: os.checklist
      ? {
          ...os.checklist,
          id: os.checklist.id.toString(),
        }
      : null,
  };
}

export class OrdemDeServicoService {
  // Lista todas as ordens de serviço
  async listarTodas() {
    const todas = await prisma.ordemDeServico.findMany({
      include: OS_INCLUDE,
    });

    return todas.map(mapOS);
  }

  // Busca uma ordem de serviço pelo ID
  async buscarPorId(id: string) {
    const os = await prisma.ordemDeServico.findUnique({
      where: { id: BigInt(id) },
      include: OS_INCLUDE,
    });

    if (!os) {
      throw new Error(`Ordem de Serviço não encontrada. ID: ${id}`);
    }

    return mapOS(os);
  }

  // Cria uma nova ordem de serviço
  async salvar(data: any) {
    // Verifica se cliente, técnico e equipamento existem
    await clienteService.buscarPorId(String(data.clienteId));
    await tecnicoService.buscarPorId(String(data.tecnicoId));
    await equipamentoService.buscarPorId(String(data.equipamentoId));

    const valorMaoDeObra = Number(data.valorMaoDeObra ?? 0);

    // Valida se o valor da mão de obra é válido e não negativo
    if (!Number.isFinite(valorMaoDeObra) || valorMaoDeObra < 0) {
      throw new Error(
        'O valor da mão de obra deve ser um número válido e não negativo.'
      );
    }

    const os = await prisma.ordemDeServico.create({
      data: {
        cliente_id: BigInt(data.clienteId),
        tecnico_id: BigInt(data.tecnicoId),
        equipamento_id: BigInt(data.equipamentoId),
        agendamento_id: data.agendamentoId
          ? BigInt(data.agendamentoId)
          : null,
        dataAbertura: new Date(),
        status: StatusOS.ABERTA,
        valorMaoDeObra,
        valorTotal: valorMaoDeObra,
        diagnosticoTecnico: data.diagnosticoTecnico ?? null,
      },
      include: OS_INCLUDE,
    });

    return mapOS(os);
  }

  // Atualiza o status de uma ordem de serviço
  async atualizarStatus(id: string, status: StatusOS) {
    const os = await prisma.ordemDeServico.findUnique({
      where: { id: BigInt(id) },
    });

    if (!os) {
      throw new Error(`Ordem de Serviço não encontrada. ID: ${id}`);
    }

    const updated = await prisma.ordemDeServico.update({
      where: { id: BigInt(id) },
      data: {
        status,
        dataConclusao:
          status === StatusOS.CONCLUIDA ? new Date() : undefined,
      },
      include: OS_INCLUDE,
    });

    return mapOS(updated);
  }

  // Adiciona material a uma ordem de serviço
  async adicionarMaterial(
    idOS: string,
    idMaterial: string,
    quantidade: number
  ) {
    // Valida se a quantidade é um número inteiro positivo
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new Error(
        'A quantidade de material deve ser um número inteiro maior que zero.'
      );
    }

    const os = await prisma.ordemDeServico.findUnique({
      where: { id: BigInt(idOS) },
      include: { itensMaterial: true },
    });

    if (!os) {
      throw new Error(`Ordem de Serviço não encontrada. ID: ${idOS}`);
    }

    // Impede alterações em ordens concluídas ou canceladas
    if (
      os.status === StatusOS.CONCLUIDA ||
      os.status === StatusOS.CANCELADA
    ) {
      throw new Error(
        'Não é possível adicionar materiais a uma OS concluída ou cancelada.'
      );
    }

    const material = await materialService.buscarPorId(idMaterial);

    // Cria o item de material vinculado à ordem de serviço
    await prisma.itemMaterial.create({
      data: {
        ordem_servico_id: BigInt(idOS),
        material_id: BigInt(idMaterial),
        quantidade,
        precoUnitarioCobrado: material.precoUnitario,
      },
    });

    // Busca os materiais vinculados à OS
    const itens = await prisma.itemMaterial.findMany({
      where: { ordem_servico_id: BigInt(idOS) },
    });

    // Calcula o valor total dos materiais utilizados
    const totalMateriais = itens.reduce(
      (acc, i) => acc + i.quantidade * i.precoUnitarioCobrado,
      0
    );

    // Atualiza o valor total da OS
    const updated = await prisma.ordemDeServico.update({
      where: { id: BigInt(idOS) },
      data: {
        valorTotal: os.valorMaoDeObra + totalMateriais,
      },
      include: OS_INCLUDE,
    });

    return mapOS(updated);
  }

  // Cria ou atualiza o checklist de uma ordem de serviço
  async definirChecklist(idOS: string, data: any) {
    const os = await prisma.ordemDeServico.findUnique({
      where: { id: BigInt(idOS) },
    });

    if (!os) {
      throw new Error(`Ordem de Serviço não encontrada. ID: ${idOS}`);
    }

    // Impede alterações no checklist de OS concluída ou cancelada
    if (
      os.status === StatusOS.CONCLUIDA ||
      os.status === StatusOS.CANCELADA
    ) {
      throw new Error(
        'Não é possível alterar o checklist de uma OS concluída ou cancelada.'
      );
    }

    // Cria ou atualiza o checklist vinculado à OS
    await prisma.checklist.upsert({
      where: {
        ordem_servico_id: BigInt(idOS),
      },
      update: {
        pressaoOk: data.pressaoOk,
        temperaturaOk: data.temperaturaOk,
        limpezaOk: data.limpezaOk,
        vazamentoVerificado: data.vazamentoVerificado,
        observacoesGerais: data.observacoesGerais ?? null,
      },
      create: {
        ordem_servico_id: BigInt(idOS),
        pressaoOk: data.pressaoOk,
        temperaturaOk: data.temperaturaOk,
        limpezaOk: data.limpezaOk,
        vazamentoVerificado: data.vazamentoVerificado,
        observacoesGerais: data.observacoesGerais ?? null,
      },
    });

    const updated = await prisma.ordemDeServico.findUnique({
      where: { id: BigInt(idOS) },
      include: OS_INCLUDE,
    });

    return mapOS(updated!);
  }

  // Exclui uma ordem de serviço
  async deletar(id: string) {
    await this.buscarPorId(id);

    await prisma.ordemDeServico.delete({
      where: { id: BigInt(id) },
    });
  }
}
