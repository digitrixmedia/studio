import { doc, getDoc, updateDoc } from "firebase/firestore";
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

  for (const orderItem of order.items) {
    // skip meal-deal children
    if (orderItem.isMealChild) continue;

    // find the matching menu item
    const menuItem = menuItems.find((m) => m.id === orderItem.baseMenuItemId);
    if (!menuItem) continue;

    let allIngredients: { ingredientId: string; qty: number }[] = [];

    /** base recipe */
    if (menuItem.ingredients) {
      allIngredients.push(
        ...menuItem.ingredients.map((ing) => ({
          ingredientId: ing.ingredientId,
          qty: ing.quantity * orderItem.quantity,
        }))
      );
    }

    /** variation recipe */
    if (orderItem.variation?.ingredients) {
      allIngredients.push(
        ...orderItem.variation.ingredients.map((ing) => ({
          ingredientId: ing.ingredientId,
          qty: ing.quantity * orderItem.quantity,
        }))
      );
    }

    /** addons */
    if (orderItem.addons) {
      for (const addon of orderItem.addons) {
        if ((addon as any).ingredients) {
          allIngredients.push(
            ...(addon as any).ingredients.map((ing: any) => ({
              ingredientId: ing.ingredientId,
              qty: ing.quantity * orderItem.quantity,
            }))
          );
        }
      }
    }

    /** apply deductions */
    for (const ing of allIngredients) {
      await deductSingleIngredient(
        ing.ingredientId,
        ing.qty,
        firestore,
        outletId
      );
    }
  }

  console.log("✅ Stock deduction completed");
}

/**
 * Deduct stock for one ingredient
 */
async function deductSingleIngredient(
  ingredientId: string,
  qty: number,
  firestore: any,
  outletId: string,
) {
  const ref = doc(
    firestore,
    `outlets/${outletId}/ingredients/${ingredientId}`
  );

  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return;

  const ingredient = snapshot.data() as Ingredient;
  const newStock = ingredient.stock - qty;

  await updateDoc(ref, { stock: newStock });

  /** low stock warning */
  if (newStock <= ingredient.minStock) {
    console.log(`⚠️ Low stock alert: ${ingredient.name}`);
  }
}
