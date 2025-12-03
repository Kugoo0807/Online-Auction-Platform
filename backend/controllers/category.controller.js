import { categoryService } from '../services/category.service.js';

class CategoryController {
    async createCategory(req, res) {
        try {
            const parent_name = req.body.parent;

            let parentId = null;
            if (parent_name) {
                const parent_found = await categoryService.getCategoryByName(parent_name);
                if (!parent_found) {
                    return res.status(400).json({ message: `Danh mục cha '${parent_name}' không tồn tại!` });
                }
                parentId = parent_found._id;
            }

            const data = { ...req.body, parent: parentId };
            
            const newCategory = await categoryService.createCategory(data);

            res.status(201).json({
                message: 'Tạo danh mục thành công!',
                data: newCategory
            })
        } catch (error) {
            res.status(400).json({ 
                message: 'Tạo danh mục thất bại!', 
                error: error.message 
            });
        }
    }

    async getAllCategories(req, res) {
        try {
            const categories = await categoryService.getAllCategories();
            res.status(200).json({
                message: 'Lấy danh mục thành công!',
                data: categories
            })
        } catch (error) {
            res.status(500).json({
                message: 'Lỗi server khi lấy danh mục',
                error: error.message 
            });
        }
    }

    async getCategory(req, res) {
        try {
            const { id } = req.params;

            const category_found = await categoryService.getCategoryById(id);
            res.status(200).json({
                message: 'Lấy danh mục thành công!',
                data: category_found
            })
        } catch (error) {
            res.status(500).json({
                message: 'Lỗi server khi lấy danh mục',
                error: error.message 
            });
        }
    }

    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (updateData.parent) {
                 const parent_found = await categoryService.getCategoryByName(updateData.parent);
                 if (!parent_found) {
                     return res.status(400).json({ message: `Danh mục cha '${updateData.parent}' không tồn tại!` });
                 }
                 updateData.parent = parent_found._id;
            }

            const updatedCategory = await categoryService.updateCategory(id, updateData);

            return res.status(200).json({
                message: 'Cập nhật danh mục thành công!',
                data: updatedCategory
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Cập nhật danh mục thất bại!',
                error: error.message
            });
        }
    }

    async deleteCategory(req, res) {
        try {
            const { id } = req.params;

            await categoryService.deleteCategory(id);

            return res.status(200).json({
                message: 'Xóa danh mục thành công!'
            });
        } catch (error) {
            return res.status(400).json({
                message: 'Xóa danh mục thất bại!',
                error: error.message
            });
        }
    }
}

export const categoryController = new CategoryController();