/**
 * 初始化数据库工具函数
 * @template T
 * @param {import('mongoose').Model<T>} Model - Mongoose 数据模型
 * @returns {Object} - 包含各种数据库操作函数的工具对象
 */
const init = function (Model) {
	/**
	 * 记录耗时操作
	 * @param {string} operation - 操作名称
	 * @param {Date} startTime - 开始时间
	 * @param {number} [threshold=500] - 阈值(ms)
	*/
	const logSlowOperation = (operation, startTime, threshold = 100) => {
		const duration = Date.now() - startTime.getTime();
		if (duration > threshold) {
			console.warn(`[DB Perf] ${operation} 耗时: ${duration}ms`);
		}
	};
  
	/**
	 * 执行数据库操作并记录性能
	 * @param {string} operationName - 操作名称
	 * @param {() => Promise<R>} operation - 数据库操作函数
	 * @returns {Promise<R>}
	*/
	const executeWithPerfLogging = async (operationName, operation) => {
		const startTime = new Date();
		try {
			const result = await operation();
			logSlowOperation(operationName, startTime);
			return result;
		} catch (error) {
			logSlowOperation(operationName, startTime);
			throw error;
		}
	};
  
	/**
	 * 处理分页参数
	 * @param {Object} [opt] - 选项
	 * @returns {Object} 处理后的选项
	*/
	const processPaginationOpts = (opt) => {
		if (!opt) return {};
		const processed = { ...opt };
		if (processed.limit) processed.limit = parseInt(processed.limit);
		if (processed.skip) processed.skip = parseInt(processed.skip);
		return processed;
	};
  
	return {
		/**
		 * 创建对象
		 * @param {Object} info - 创建的参数
		 * @returns {Promise<T>}
		 */
		create: (info) => executeWithPerfLogging('create', () => Model.create(info)),
	
		/**
		 * 通过id查找
		 * @param {string|import('mongoose').Types.ObjectId} id - 文档ID
		 * @param {Object|string} [projection] - 投影
		 * @param {Object} [options] - 选项
		 * @returns {Promise<T|null>}
		 */
		findById: (id, projection, options) => executeWithPerfLogging('findById', () => Model.findById(id, projection, options).exec()),
	
		/**
		 * 通过id查找(lean)
		 * @param {string|import('mongoose').Types.ObjectId} id - 文档ID
		 * @param {Object|string} [projection] - 投影
		 * @param {Object} [options] - 选项
		 * @returns {Promise<Object|null>}
		 */
		leanFindById: (id, projection, options) => executeWithPerfLogging('leanFindById', () => Model.findById(id, projection, options).lean().exec()),
	
		/**
		 * 查找满足条件的一个对象
		 * @param {Object} condition - 查询条件
		 * @param {Object|string} [projection] - 投影
		 * @param {Object} [options] - 选项
		 * @returns {Promise<T|null>}
		 */
		findOne: (condition, projection, options) => executeWithPerfLogging('findOne', () => Model.findOne(condition, projection, options).exec()),
	
		/**
		 * 查找满足条件的一个对象(lean)
		 * @param {Object} condition - 查询条件
		 * @param {Object|string} [projection] - 投影
		 * @param {Object} [options] - 选项
		 * @returns {Promise<Object|null>}
		 */
		leanFindOne: (condition, projection, options) => executeWithPerfLogging('leanFindOne', () => Model.findOne(condition, projection, options).lean().exec()),
	
		/**
		 * 查找满足条件的多个对象
		 * @param {Object} condition - 查询条件
		 * @param {Object|string} [projection] - 投影
		 * @param {Object} [options] - 选项
		 * @returns {Promise<T[]>}
		 */
		find: (condition, projection, options) => executeWithPerfLogging('find', () => Model.find(condition, projection, processPaginationOpts(options)).exec()),
	
		/**
		 * 查找满足条件的多个对象(lean)
		 * @param {Object} condition - 查询条件
		 * @param {Object|string} [projection] - 投影
		 * @param {Object} [options] - 选项
		 * @returns {Promise<Object[]>}
		 */
		leanFind: (condition, projection, options) => executeWithPerfLogging('leanFind', () => Model.find(condition, projection, processPaginationOpts(options)).lean().exec()),
	
		/**
		 * 计算满足条件的文档数量
		 * @param {Object} condition - 查询条件
		 * @returns {Promise<number>}
		 */
		findAndCount: (condition) => executeWithPerfLogging('findAndCount', () => Model.countDocuments(condition).exec()),
	
		/**
		 * 通过id查找并且更新
		 * @param {string|import('mongoose').Types.ObjectId} id - 文档ID
		 * @param {Object} update - 更新操作
		 * @param {Object} [options] - 选项
		 * @returns {Promise<T|null>}
		 */
		findByIdAndUpdate: (id, update, options = { new: true }) => executeWithPerfLogging('findByIdAndUpdate', () => Model.findByIdAndUpdate(id, update, options).exec()),
	
		/**
		 * 查找一个文档并更新
		 * @param {Object} condition - 查询条件
		 * @param {Object} update - 更新操作
		 * @param {Object} [options] - 选项
		 * @returns {Promise<T|null>}
		 */
		findOneAndUpdate: (condition, update, options = { new: true }) => executeWithPerfLogging('findOneAndUpdate', () => Model.findOneAndUpdate(condition, update, options).exec()),
	
		/**
		 * 批量更新文档
		 * @param {Object} condition - 查询条件
		 * @param {Object} update - 更新操作
		 * @param {Object} [options] - 选项
		 * @returns {Promise<import('mongoose').UpdateWriteOpResult>}
		 */
		updateMany: (condition, update, options) => executeWithPerfLogging('updateMany', () => Model.updateMany(condition, update, options).exec()),
	
		/**
		 * 批量删除文档
		 * @param {Object} condition - 查询条件
		 * @returns {Promise<import('mongoose').DeleteResult>}
		 */
		deleteMany: (condition) => executeWithPerfLogging('deleteMany', () => Model.deleteMany(condition).exec()),
	
		/**
		 * 通过id查找并且删除
		 * @param {string|import('mongoose').Types.ObjectId} id - 文档ID
		 * @returns {Promise<T|null>}
		 */
		findByIdAndRemove: (id) => executeWithPerfLogging('findByIdAndRemove', () => Model.findByIdAndDelete(id).exec()),
	
		/**
		 * 查找一个文档并删除
		 * @param {Object} condition - 查询条件
		 * @returns {Promise<T|null>}
		 */
		findOneAndRemove: (condition) => executeWithPerfLogging('findOneAndRemove', () => Model.findOneAndDelete(condition).exec()),
	
		/**
		 * 填充引用
		 * @param {T|T[]} docs - 要填充的文档
		 * @param {Object} options - 填充选项
		 * @returns {Promise<T|T[]>}
		 */
		populate: (docs, options) => executeWithPerfLogging('populate', () => Model.populate(docs, options)),
	
		/**
		 * 获取字段唯一值
		 * @param {string} field - 字段名
		 * @param {Object} [condition] - 查询条件
		 * @returns {Promise<any[]>}
		 */
		distinct: (field, condition) => executeWithPerfLogging('distinct', () => Model.distinct(field, condition).exec()),
	
		/**
		 * 聚合查询
		 * @param {Object[]} pipeline - 聚合管道
		 * @returns {Promise<any[]>}
		 */
		aggregate: (pipeline) => executeWithPerfLogging('aggregate', () => Model.aggregate(pipeline).exec())
	};
};
  
exports = module.exports = init;