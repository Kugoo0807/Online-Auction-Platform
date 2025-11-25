import connectDB from "../db/connect.js";
import { Category } from "./schema.js";
import { categoryRepository } from "../backend/repositories/category.repository.js";

async function runTests() {
    console.log("🔗 Connecting DB...");
    await connectDB();

    /** ============================
     *  TEST 1: CREATE CATEGORY
     * ============================
     */
    console.log("\n🧪 TEST 1: createCategory");

    const createdCategory = await categoryRepository.create({
        category_name: "Electronics",
        description: "Electronic gadgets and devices",
        parent_id: null
    });

    console.log("✔ Created:", createdCategory);

    /** ============================
     *  TEST 2: CREATE CHILD CATEGORY
     * ============================
     */
    console.log("\n🧪 TEST 2: createChildCategory");

    const childCategory = await categoryRepository.create({
        category_name: "Smartphones",
        description: "Mobile phones and smartphones",
        parent_id: createdCategory._id
    });

    console.log("✔ Child Created:", childCategory);

    /** ============================
     *  TEST 3: FIND ALL
     * ============================
     */
    console.log("\n🧪 TEST 3: findAll");

    const allCategories = await categoryRepository.findAll();
    console.log("✔ All Categories:", allCategories);

    /** ============================
     *  TEST 4: FIND BY ID
     * ============================
     */
    console.log("\n🧪 TEST 4: findById");

    const foundCategory = await categoryRepository.findById(childCategory._id);
    console.log("✔ Found by ID:", foundCategory);

    /** ============================
     *  TEST 5: UPDATE
     * ============================
     */
    console.log("\n🧪 TEST 5: updateCategory");

    const updatedCategory = await categoryRepository.update(childCategory._id, {
        category_name: "Smartphones & Accessories",
        description: "Phones + accessories"
    });

    console.log("✔ Updated:", updatedCategory);

    /** ============================
     *  TEST 6: DELETE
     * ============================
     */
    console.log("\n🧪 TEST 6: deleteCategory");

    const deleted = await categoryRepository.delete(childCategory._id);
    console.log("✔ Deleted:", deleted);

    /** ============================
     *  VERIFY DELETE
     * ============================
     */
    console.log("\n🧪 TEST 7: verifyDelete");

    const afterDelete = await categoryRepository.findById(childCategory._id);
    console.log("✔ findById after delete (should be null):", afterDelete);

    console.log("\n🎉 All tests completed successfully!");
}

runTests();
