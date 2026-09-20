import React from 'react';
import { Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import { Button, Card, IconButton, QuantityStepper, Tag, formatPrice } from '../ui';

/* One dish. Customers add and adjust; the owner edits and deletes in the
   same row, so the menu is managed where it is read. */

export default function DishRow({ product, quantity = 0, onAdd, onRemove, isOwner, onEdit, onDelete }) {
  const styles = useStyles();

  return (
    <Card style={styles.card}>
      <View style={styles.text}>
        <Text style={styles.name}>{product.name}</Text>
        {product.description ? <Text style={styles.description}>{product.description}</Text> : null}
        <Tag style={styles.price}>{formatPrice(product.price)}</Tag>
      </View>

      <View style={styles.action}>
        {isOwner ? (
          <>
            <IconButton icon="edit" label={`עריכת ${product.name}`} variant="outline" onPress={() => onEdit(product)} />
            <IconButton icon="trash" label={`מחיקת ${product.name}`} variant="danger" onPress={() => onDelete(product)} />
          </>
        ) : quantity > 0 ? (
          <QuantityStepper
            value={quantity}
            label={product.name}
            onDecrease={() => onRemove(product)}
            onIncrease={() => onAdd(product)}
          />
        ) : (
          <Button size="sm" icon="plus" onPress={() => onAdd(product)}>
            הוספה
          </Button>
        )}
      </View>
    </Card>
  );
}

const useStyles = createStyles(({ colors, space, type }) => ({
  card: {
    ...rtl.row,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[4],
    padding: space[4],
    marginBottom: space[3],
  },
  text: { flex: 1, gap: space[2], alignItems: 'flex-end' },
  name: { ...type.h3, ...rtl.text, color: colors.ink },
  description: { ...type.caption, ...rtl.text, color: colors.inkMuted },
  price: { marginTop: space[1] },
  action: { ...rtl.row, alignItems: 'center', gap: space[2] },
}));
