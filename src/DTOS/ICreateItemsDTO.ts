export interface ICreateItemsDTO {
  codMesa: string;
  codProduto: string;
  qtde: number;
  obs: string;
  codAtendente: string;
  destino: string;
  mobileId: string;
  combinado: boolean;
  codCombinado: string;
  flavors: ICreateItemsDTO[];
}
