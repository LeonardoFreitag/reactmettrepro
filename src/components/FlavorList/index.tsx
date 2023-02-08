import { HStack, Text, VStack } from 'native-base';
import { ItemModel } from '../../models/ItemModel';

type Props = {
  flavors: ItemModel[];
};

export const FlavorList: React.FC<Props> = ({ flavors }: Props) => {
  return (
    <VStack>
      {flavors.map((flavor, index) => {
        let qtde = '';
        if (flavor.quantidade >= 0.33 && flavor.quantidade <= 0.34) {
          qtde = '1/3';
        }
        if (flavor.quantidade === 0.5) {
          qtde = '1/2';
        }
        if (flavor.quantidade === 0.25) {
          qtde = '1/4';
        }
        return (
          <HStack key={index}>
            <Text
              fontSize={12}
              fontStyle="italic"
              paddingLeft={4}>{`${qtde} ${flavor.descricao}`}</Text>
            {flavor.obs.trim() !== '' && (
              <Text
                fontSize={12}
                fontStyle="italic"
                paddingLeft={4}>{`[${flavor.obs}]`}</Text>
            )}
          </HStack>
        );
      })}
    </VStack>
  );
};
