import dotenv from 'dotenv';
dotenv.config();

import { qnaRepository } from '../repositories/qna.repository.js';
import { productRepository } from '../repositories/product.repository.js';
import * as mailService from './email.service.js';

const PRODUCT_URL_PREFIX = process.env.VITE_URL + 'product/' || 'http://localhost:3000/product/';

class QnaService {
	async askQuestion({ product_id, asker, question_content }) {
		if (!product_id || !asker || !question_content || !question_content.trim()) {
			throw new Error('Thiếu dữ liệu: product_id, asker, question_content');
		}

		const product = await productRepository.findById(product_id);
		if (!product) {
			throw new Error('Sản phẩm không tồn tại');
		}
		
		const sellerId = product.seller._id || product.seller;
		if (sellerId.toString() === asker.toString()) {
			throw new Error('Người bán không thể đặt câu hỏi cho chính sản phẩm của họ');
		}

		const bannedSet = new Set(
            (product.banned_bidder || []).map(id => id.toString())
        );
		if (bannedSet.has(asker.toString())) {
			throw new Error('Người dùng đã bị cấm tham gia đấu giá sản phẩm này, không thể đặt câu hỏi');
		}

		const qna = await qnaRepository.create({
			product: product_id,
			asker,
			question_content: question_content.trim()
		});

		try {
			const populated = await qnaRepository.findById(qna._id);
			const sellerEmail = populated?.product?.seller?.email;
			const productUrl = PRODUCT_URL_PREFIX + (populated?.product?._id || '');
			if (sellerEmail) {
				await mailService.notifyNewQuestion(
					sellerEmail,
					populated.product?.product_name || 'Sản phẩm của bạn',
					populated.question_content,
					productUrl
				);
			}
		} catch (e) {
			// non-blocking
		}

		return qna;
	}

	async listByProduct(productId) {
		if (!productId) throw new Error('Thiếu productId');
		return await qnaRepository.findbyProductId(productId);
	}

	async answerQuestion(qnaId, { answerer, answer_content }) {
		if (!qnaId || !answerer || !answer_content || !answer_content.trim()) {
			throw new Error('Thiếu dữ liệu: qnaId, answerer, answer_content');
		}

		// Fetch QnA với population
		const qna = await qnaRepository.findById(qnaId);
		if (!qna) {
			throw new Error('Câu hỏi không tồn tại');
		}
		if (qna.answer_content) {
			throw new Error('Câu hỏi đã được trả lời, không thể trả lời lại');
		}
		if (answerer.toString() !== qna.product.seller?._id.toString()) {
			throw new Error('Chỉ người bán của sản phẩm mới có thể trả lời câu hỏi này');
		}

		const answerData = {
			answerer,
			answer_content: answer_content.trim(),
			answer_timestamp: new Date()
		};		
		await qnaRepository.addAnswer(qnaId, answerData);

		// Refetch with population for email and return
		let populated;
		try {
			populated = await qnaRepository.findById(qnaId);
		} catch (e) {}

		try {
			const askerEmail = populated?.asker?.email;
			const productName = populated?.product?.product_name || 'Sản phẩm';
			const productUrl = PRODUCT_URL_PREFIX + (populated?.product?._id || '');
			if (askerEmail) {
				await mailService.notifyNewAnswer(
					[askerEmail],
					productName,
					populated?.question_content || '',
					answerData.answer_content,
					productUrl
				);
			}
		} catch (e) {
		}

		return populated || (await qnaRepository.findById(qnaId));
	}

	async deleteQuestion(qnaId) {
		if (!qnaId) throw new Error('Thiếu qnaId');
		return await qnaRepository.deleteById(qnaId);
	}
}

export const qnaService = new QnaService();