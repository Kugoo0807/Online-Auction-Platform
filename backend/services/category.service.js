import { categoryRepository } from '../repositories/category.repository.js';

class CategoryService {
    async createCategory(categoryData) {
        const existed = await categoryRepository.findByName(categoryData.category_name);
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
            const existed = await categoryRepository.findByName(updateData.category_name);
            if (existed && existed._id.toString() !== categoryId) {
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
