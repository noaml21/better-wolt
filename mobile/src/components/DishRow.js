import React from 'react';
import { Text, View } from 'react-native';
import { createStyles, rtl } from '../theme';
import { AddButton, IconButton, QuantityStepper, formatPrice } from '../ui';

/* One dish as a stop on the restaurant's route (V5 spec §5, §11): the
   line runs down the right edge through each stop's ring — every row
   draws its own segment, so the line starts at the first ring and ends at
   the last — and a dish in the cart fills its ring with the line colour
   and its count. The add action repeats on every row, so it is a quiet
   outlined square. The owner edits and deletes in the same row. `line` is
   the restaurant's [fill, text] pair. */

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
  line,
}) {
  const styles = useStyles();
  const inCart = quantity > 0;
  const [fill, onFill] = line || [styles.fallback.color, styles.fallback.backgroundColor];

  return (
    <View style={[styles.row, !last && styles.divided]}>
      <View style={styles.rail} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View
          style={[
            styles.segment,
            { backgroundColor: fill },
            first && styles.segmentFirst,
            last && styles.segmentLast,
          ]}
        />
        <View style={[styles.ring, { borderColor: fill }, inCart && { backgroundColor: fill }]}>
          {inCart ? <Text style={[styles.ringText, { color: onFill }]}>{quantity}</Text> : null}
        </View>
      </View>

      <View style={styles.text}>
        <Text style={styles.name}>{product.name}</Text>
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

const RING = 34;

const useStyles = createStyles(({ colors, space, radius, type }) => ({
  row: {
    ...rtl.row,
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[4],
  },
  divided: { borderBottomWidth: 1, borderBottomColor: colors.hairline },
  fallback: { color: colors.ink, backgroundColor: colors.onInk },
  /* The rail spans the row's full height so segments meet across rows. */
  rail: { width: RING, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', marginVertical: -space[4] },
  segment: { position: 'absolute', top: 0, bottom: 0, width: 8 },
  segmentFirst: { top: '50%' },
  segmentLast: { bottom: '50%' },
  ring: {
    width: RING,
    height: RING,
    borderRadius: radius.circle,
    borderWidth: 5,
    backgroundColor: colors.ground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: { ...type.caption, ...type.num, fontWeight: '900' },
  text: { flex: 1, gap: 2, alignItems: 'flex-end' },
  name: { ...type.h3, ...rtl.text, fontSize: 18, lineHeight: 24, fontWeight: '800', color: colors.ink },
  description: { ...type.body, ...rtl.text, fontSize: 14, lineHeight: 20, color: colors.inkMuted },
  price: { ...type.price, ...rtl.text, marginTop: 2, color: colors.ink },
  action: { ...rtl.row, alignItems: 'center', gap: space[2] },
}));
