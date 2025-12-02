import { qnaRepository } from '../repositories/qna.repository.js';
import * as mailService from './email.service.js';

class QnaService {
	async askQuestion({ product, asker, question_content }) {
		if (!product || !asker || !question_content || !question_content.trim()) {
			throw new Error('Thiếu dữ liệu: product, asker, question_content');
		}
		const qna = await qnaRepository.create({
			product,
			asker,
			question_content: question_content.trim()
		});

		try {
			const populated = await qnaRepository.findById(qna._id);
			const sellerEmail = populated?.product?.seller?.email;
			if (sellerEmail) {
				await mailService.notifyNewQuestion(
					sellerEmail,
					populated.product?.product_name || 'Sản phẩm của bạn',
					populated.question_content
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
			if (askerEmail) {
				await mailService.notifyNewAnswer(
					[askerEmail],
					productName,
					populated?.question_content || '',
					answerData.answer_content				);
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