import { categoryRepository } from '../repositories/category.repository.js';
import { productRepository } from '../repositories/product.repository.js';

class CategoryService {
    async createCategory(data) {
        const existed = await categoryRepository.findByName(data.category_name);
        if (existed) {
            throw new Error("Tên danh mục đã tồn tại!");
        }
        return await categoryRepository.create(data);
    }

    async getAllCategories() {
        return await categoryRepository.findAll();
    }

    async getCategoryById(id) {
        return await categoryRepository.findById(id);
    }

    async getCategoryByName(category_name) {
        return await categoryRepository.findByName(category_name);
    }

    async updateCategory(id, updateData) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new Error('Danh mục không tồn tại!');
        }

        if (updateData.category_name) {
            const existed = await categoryRepository.findByName(updateData.category_name);
            if (existed && existed._id.toString() !== id) {
                throw new Error("Tên danh mục đã tồn tại!");
            }
        }
        return await categoryRepository.update(id, updateData);
    }

    async deleteCategory(id) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new Error('Danh mục không tồn tại!');
        }

        // Chứa danh mục con
        const hasChildren = await categoryRepository.hasChildren(id);
        if (hasChildren) {
            throw new Error('Không thể xóa danh mục! Danh mục đang chứa danh mục con.')
        }

        // Chứa sản phẩm
        const allRelatedIds = await categoryRepository.getAllDescendantIds(id);
        const hasProduct = await productRepository.existsInCategories(allRelatedIds);
        if (hasProduct) {
            throw new Error('Không thể xóa danh mục! Danh mục đang chứa sản phẩm.');
        }

        return await categoryRepository.delete(id);
    }
}

export const categoryService = new CategoryService();
