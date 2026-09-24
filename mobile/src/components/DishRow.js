import React from 'react';
import { Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import { AddButton, IconButton, QuantityStepper, formatPrice } from '../ui';

/* One dish, read the way a menu is read: name, what is in it, what it
   costs (V4 spec §5). Rows sit together on one surface divided by
   hairlines — `first`/`last` round the surface's corners — instead of a
   card each. The add action repeats on every row, so it is a quiet round
   control, not a labelled button. The owner edits and deletes in the
   same row, so the menu is managed where it is read. */

export default function DishRow({
  product,
  quantity = 0,
  onAdd,
  onRemove,
  isOwner,
  onEdit,
  onDelete,
  first = false,
  last = false,
}) {
  const styles = useStyles();
  const inCart = quantity > 0;

  return (
    <View style={[styles.row, first && styles.first, last && styles.last]}>
      {!first ? <View style={styles.hairline} /> : null}

      <View style={styles.text}>
        <View style={styles.nameRow}>
          {inCart ? (
            <View style={styles.count} accessibilityElementsHidden importantForAccessibility="no">
              <Text style={styles.countText}>{quantity}</Text>
            </View>
          ) : null}
          <Text style={styles.name}>{product.name}</Text>
        </View>
        {product.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        ) : null}
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
      </View>

      <View style={styles.action}>
        {isOwner ? (
          <>
            <IconButton icon="edit" label={`עריכת ${product.name}`} variant="outline" onPress={() => onEdit(product)} />
            <IconButton icon="trash" label={`מחיקת ${product.name}`} variant="danger" onPress={() => onDelete(product)} />
          </>
        ) : inCart ? (
          <QuantityStepper
            value={quantity}
            label={product.name}
            onDecrease={() => onRemove(product)}
            onIncrease={() => onAdd(product)}
          />
        ) : (
          <AddButton name={product.name} onPress={() => onAdd(product)} />
        )}
      </View>
    </View>
  );
}

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  row: {
    ...rtl.row,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: space[4],
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.line,
  },
  first: { borderTopWidth: 1, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  last: { borderBottomWidth: 1, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  hairline: {
    position: 'absolute',
    top: 0,
    left: space[4],
    right: space[4],
    height: 1,
    backgroundColor: colors.line,
  },
  text: { flex: 1, gap: 4, alignItems: 'flex-end' },
  nameRow: { ...rtl.row, alignItems: 'center', gap: space[2], maxWidth: '100%' },
  count: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.flame,
  },
  countText: { ...type.micro, ...type.num, color: colors.onFlame, fontWeight: '800' },
  name: { ...type.h3, ...rtl.text, flexShrink: 1, fontSize: 17, lineHeight: 23, fontWeight: '600', color: colors.ink },
  description: { ...type.caption, ...rtl.text, fontWeight: '400', fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  price: { ...type.price, ...rtl.text, marginTop: 2, color: colors.ink },
  action: { ...rtl.row, alignItems: 'center', gap: space[2] },
}));
