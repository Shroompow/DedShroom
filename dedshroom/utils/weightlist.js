class WeightList {
	/**
	 * Constructs a new WeightList
	 * @param {Array.<Object>|WeightList} [init=undefined] Either another WeightList-Instance to copy (Won't deep copy elements) or an Array in the WeightList-Format. Invalid Entries in Array will get spliced.
	 */
	constructor(init = undefined) {

		this._weightSum = 0;
		/**
		 * @example [{x:"Foo",y:1},{x:"Bar",y:2}]
		 * @type {Array.<Object>}
		 */
		this.data = [];

		if (Array.isArray(init)) {
			//Import raw data
			this.data = init;
			//Check data
			for (let i = 0; i < this.data.length; i++) {
				let pair = this.data[i];
				if (typeof pair === "object" && pair.x && typeof pair.y === "number") {
					//Apply weight-minimum of 0
					pair.y = Math.max(0, pair.y);
					//Update weightsum
					this._weightSum += pair.y;
				} else {
					//Pair is invalid.
					this.data.splice(i);
					i--;
				}
			}
		} else if (init instanceof WeightList) {
			//Copy data
			this._weightSum = init.weightSum();
			for (let i = 0; i < init.data.length; i++) {
				let pair = init.data[i];
				this.data.push({ x: pair.x, y: pair.y });
			}
		}
	}

	/**
	 * @returns {number} Count of all elements in the list.
	 */
	count() {
		return this.data.length;
	}

	/**
	 * @returns {number} Sum of all weights in the list.
	 */
	weightSum() {
		return this._weightSum;
	}

	/**
	 * Pushes a pair onto the list.
	 * @param {*} element Element of the pair.
	 * @param {number} [weight=1] Weight of the pair. Cant be negative.
	 * @returns {number} The index of the inserted pair.
	 */
	push(element, weight = 1) {
		let w = Math.max(0, weight);
		this._weightSum += w;
		return this.data.push({ x: element, y: w }) - 1;
	}

	/**
	 * Removes a pair.
	 * @param {number} index The index of the pair to remove.
	 * @returns {*} Element of the removed pair or undefined.
	 */
	remove(index) {
		let pair = this.data[index];
		if (pair) {
			this.data.splice(index);
			return pair.x;
		}
		return undefined;
	}

	/**
	 * @param {number} index The index in the list.
	 * @returns {Object} The element or undefined.
	 */
	get(index) {
		let pair = this.data[index];
		return pair ? pair.x : undefined;
	}

	/**
	 * @param {number} index The index in the list.
	 * @returns {number} The weight of a pair or 0.
	 */
	weightOf(index) {
		let pair = this.data[index];
		return pair ? pair.y : 0;
	}

	/**
	 * @param {number} factor The weigh-factor. Ranges from 0.0 to 1.0. Out of range values will be clamped.
	 * @returns {*} The element.
	 */
	getWeighted(factor) {
		let weightSum = this.weightSum();
		let targetWeight = Math.max(0, Math.min(weightSum, factor * weightSum));

		let currWeight = 0;
		//Linear search
		for (let i = 0; i < this.data.length; i++) {
			let pair = this.data[i];
			//Add weight of pair to currWeight
			//Reached target?
			if ((currWeight += pair.y) >= targetWeight) {
				return pair.x;
			}
		}
		//Not found for some strange reason
		return undefined;
	}
}

module.exports = WeightList;