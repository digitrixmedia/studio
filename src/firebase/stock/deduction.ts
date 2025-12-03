import { doc, getDoc, writeBatch } from "firebase/firestore";
import type { AppOrder, MenuItem, Ingredient } from "@/lib/types";

/**
 * Deduct stock for a completed order
 */
export async function deductIngredientsForOrder(
  order: AppOrder,
  menuItems: MenuItem[],
  firestore: any,
  outletId: string,
) {
  console.log("🔧 Running stock deduction for:", order.orderNumber);

  // ingredientId -> total qty to deduct
  const groupedUsage: Record<string, number> = {};

  for (const orderItem of order.items) {
    // Skip meal-deal children, we only use the parent
    if (orderItem.isMealChild) continue;

    const menuItem = menuItems.find(
      (m) => m.id === orderItem.baseMenuItemId
    );
    if (!menuItem) continue;

    const qty = orderItem.quantity || 1;

    console.log(
      "➡️ Item:",
      menuItem.name,
      "| qty:",
      qty,
      "| variation:",
      orderItem.variation?.name || "none"
    );

    // -----------------------------
    // 1️⃣ Try to get variation recipe
    // -----------------------------
    let variationIngredients:
      | { ingredientId: string; quantity: number }[]
      | undefined;

    if (orderItem.variation?.id && Array.isArray(menuItem.variations)) {
      const matchedVariation = menuItem.variations.find(
        (v: any) => v.id === orderItem.variation!.id
      );

      if (matchedVariation?.ingredients?.length) {
        variationIngredients = matchedVariation.ingredients;
        console.log(
          `   ✅ Using variation recipe for "${matchedVariation.name}"`
        );
      }
    }

    // --------------------------------------
    // 2️⃣ Use variation recipe OR base recipe
    // --------------------------------------
    if (variationIngredients && variationIngredients.length > 0) {
      for (const ing of variationIngredients) {
        groupedUsage[ing.ingredientId] =
          (groupedUsage[ing.ingredientId] || 0) + ing.quantity * qty;
      }
    } else if (menuItem.ingredients?.length) {
      console.log("   ✅ Using base recipe");
      for (const ing of menuItem.ingredients) {
        groupedUsage[ing.ingredientId] =
          (groupedUsage[ing.ingredientId] || 0) + ing.quantity * qty;
      }
    } else {
      console.log("   ⚠️ No recipe found (no base + no variation)");
    }

    // 3️⃣ Add-ons (use their own recipe, if any)
    if (orderItem.addons?.length) {
      console.log(
        `   ➕ Processing ${orderItem.addons.length} addon(s) for ${menuItem.name}`
      );
      for (const addon of orderItem.addons as any[]) {
        if (addon.ingredients?.length) {
          for (const ing of addon.ingredients) {
            groupedUsage[ing.ingredientId] =
              (groupedUsage[ing.ingredientId] || 0) + ing.quantity * qty;
          }
        }
      }
    }
  }

  console.log("🧾 Final grouped usage:", groupedUsage);

  // -----------------------------
  // 4️⃣ Apply deductions in a batch
  // -----------------------------
  const batch = writeBatch(firestore);

  for (const ingredientId in groupedUsage) {
    const ref = doc(
      firestore,
      `outlets/${outletId}/ingredients/${ingredientId}`
    );

    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) {
      console.warn("   ⚠️ Ingredient not found:", ingredientId);
      continue;
    }

    const ingredient = snapshot.data() as Ingredient;
    const deduction = groupedUsage[ingredientId];

    const newStock = Math.max(0, ingredient.stock - deduction);

    console.log(
      `   📉 ${ingredient.name}: -${deduction} ${ingredient.baseUnit} (from ${ingredient.stock} → ${newStock})`
    );

    batch.update(ref, { stock: newStock });

    if (newStock <= ingredient.minStock) {
      console.log(`   ⚠️ Low stock alert: ${ingredient.name}`);
    }
  }

  await batch.commit();
  console.log("✅ Stock deduction completed");
}
