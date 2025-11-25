
import { categoryRepository } from '../repositories/category.repository.js';
import { categoryRepository } from "../backend/repositories/category.repository.js";
import { Category } from "../db/schema.js";

class CategoryService {
    async createCategory(categoryData) {
        const existed = await Category.findOne({
            category_name: categoryData.category_name
        });
        if (existed) {
            throw new Error("Category name already exists");
        }
        return await categoryRepository.create(categoryData);
    }

    async getAllCategories() {
        return await categoryRepository.findAll();
    }

    async getCategoryById(categoryId) {
        return await categoryRepository.findById(categoryId);
    }

    async updateCategory(categoryId, updateData) {
        if (updateData.category_name) {
            const existed = await Category.findOne({
                category_name: updateData.category_name,
                _id: { $ne: categoryId } 
            });
            if (existed) {
                throw new Error("Category name already exists");
            }
        }

        return await categoryRepository.update(categoryId, updateData);
    }

    async deleteCategory(categoryId) {
        return await categoryRepository.delete(categoryId);
    }
}

export const categoryService = new CategoryService();
