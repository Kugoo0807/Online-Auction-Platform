import { Category } from '../../db/schema.js';

class CategoryRepository {
    async create(data) {
        const parentId = data.parent_id || null;

        const slug = await this.generateSlug(data.category_name);
        const categoryData = { ...data, parent_id: parentId, slug };
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
        if (!updateData.parent_id) updateData.parent_id = null;

        if (updateData.parent_id && updateData.parent_id.toString() === id.toString()) {
            throw new Error("Category cannot be its own parent");
        }

        if (updateData.category_name) {
            updateData.slug = await this.generateSlug(updateData.category_name, id);
        }

        return await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate("parent_id", "category_name");
    }

    async delete(id) {
        return await Category.findByIdAndDelete(id);
    }

    async findBySlug(slug) {
        return await Category.findOne({ slug }).populate("parent_id", "category_name");
    }

    async findByName(name) {
        return await Category.findOne({ category_name: name });
    }

    async generateSlug(name, excludeId = null) {
        const baseSlug = name
            .toString()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        let slug = baseSlug;
        let count = 1;
        const filter = excludeId ? { slug, _id: { $ne: excludeId } } : { slug };
        while (await Category.findOne(filter)) {
            slug = `${baseSlug}-${count}`;
            count++;
            filter.slug = slug; 
        }
        return slug;
    }
}

export const categoryRepository = new CategoryRepository();
