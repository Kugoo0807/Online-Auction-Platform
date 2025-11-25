import { Category } from '../../db/schema.js';

class CategoryRepository {
    async create(data) {
        const categoryData = {...data,
        parent_id: data.parent_id || null
        };
        const category = new Category(categoryData);
        return await category.save();
    }

    async findAll() {
        return await Category.find().populate("parent_id", "category_name").sort({ category_name: 1 });             
    }

    async findById(id) {
        return await Category.findById(id).populate("parent_id", "category_name");
    }

    async update(id, updateData) {
        if (updateData.parent_id === "" || updateData.parent_id === undefined) {
            updateData.parent_id = null;
        }
        return await Category.findByIdAndUpdate(id, updateData,
        { new: true, runValidators: true,}).populate("parent_id", "category_name");
    }

    async delete(id) {
        return await Category.findByIdAndDelete(id);
    }
}

export const categoryRepository = new CategoryRepository();
