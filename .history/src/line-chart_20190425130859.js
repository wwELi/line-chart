import React, { useState } from 'react';

const lines = 8;
const unit = 200;

const PADDING = 40;
const TEXT_MARGIN = 50;
const MASK_WIDTH = 60;

const FONT_FAMILY = 'Microsoft Yahei';
const FONT_COLOR = '#666';
const FONT = `normal normal normal 12px ${FONT_FAMILY}`;


export default class LineChart extends React.Component {

	@observable
	bindHtml;

	@observable
	tipsStyle;

	pointX = [];
	pointY = [];
	points = [];

	_maxAndMinPoint = null;
	_rangesX = [];

	options = {
		width: 900,
		height: 400,
		data: [
			{ list: [30, 100, 10, 800], color: '#F97878', name: '累计下单订单数'},
			{ list: [56, 80, 100, 100], color: '#27BDBD', name: '累计付款订单数'}
		],
		formatTip(list) {
			return list.reduce((html, option) => {
				html = html + `<span>${ option.name }</span></br><span>${option.value}</span></span>`;
				return html;
			}, '');
		}
	};

	// x 轴文本显示的集合对应x的坐标
	xList = [];

	$postLink() {
		console.log('--- loading ---');

		this.drawBackground();
		this.drawCanvas();
	}

	drawBackground() {
		const canvas = document.querySelector('#background-canvas');
		const { width, height, data } = this.options;
		canvas.width = width;
		canvas.height = height;

		this.canvas = canvas;

		this.xList = ['2019/01/08 00:00:00', '2019/02/08', '2019/03/08', '2019/03/08'];

		this.drawYLineUnit();
		this.drawXLineUnit();
		data.forEach((line, index) => {
			this.drawLineData(line, index);
			this.drawIconOnTop(line, index);
		});
	}

	drawIconOnTop({ name, color }, index) {
		const ctx = this.canvas.getContext('2d');
		const [min] = this._maxAndMinPoint;
		const { width } = this.canvas;
		ctx.font = FONT;
		ctx.textAlign = 'right';

		const x = width - PADDING - TEXT_MARGIN - index * 200;
		ctx.fillText(name, x, min - 20);
	}

	drawCanvas() {

		const { width, height } = this.options;
		const cv = document.querySelector('#canvas');

		cv.width = width;
		cv.height = height;
		const ctx = cv.getContext('2d');

		ctx.drawImage(this.canvas, 0, 0, width, height, 0, 0, width, height);
		this.canvas = cv;
	}

	drawLineData({ list, color }) {
		if (list.length === 0) return;
		const ctx = this.canvas.getContext('2d');

		ctx.beginPath();
		ctx.save();

		for (let i = 0, len = this.pointX.length; i < len; i++) {
			const x = this.pointX[i];
			const y = this.getPointY(list[i]);

			this.points.push([x, y, color]);

			ctx.strokeStyle = color;
			ctx.lineWidth = 2;

			if (i === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}

		}

		ctx.stroke();
		ctx.closePath();
		ctx.restore();
	}

	drawYLineUnit() {

		const { canvas } = this;
		const { width, height } = canvas;
		const unitHeight = (height - PADDING * 2) / lines;

		const ctx = canvas.getContext('2d');
		ctx.save();

		ctx.lineWidth = 1;
		ctx.strokeStyle = '#DFE2E5';

		let i = lines;

		while (i) {
			const y = PADDING + i * unitHeight;
			const x = PADDING;
			const endX = x + width - 2 * PADDING;

			this.pointY.push(y);

			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.font = FONT;

			ctx.fillStyle = FONT_COLOR;
			ctx.fillText((lines - i) * unit, x - PADDING, y + 5);
			ctx.lineTo(endX, y);
			ctx.stroke();
			ctx.closePath();

			i--;
		}

		ctx.restore();

		const list = [...this.pointY];
		this._maxAndMinPoint = [list.pop(), list.shift()];
	}

	drawXLineUnit() {
		const { canvas, xList } = this;
		const ctx = canvas.getContext('2d');

		const y = canvas.height - PADDING + 10;
		const lenUnit = this.widthLenUnit;

		ctx.save();
		for (let i = 0, len = xList.length; i < len; i++) {

			const dataX = PADDING + TEXT_MARGIN + (i * lenUnit);
			this.pointX.push(dataX);

			ctx.font = FONT;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.fillStyle = FONT_COLOR;
			ctx.fillText(xList[i], dataX, y);
		}
		ctx.restore();

		const width = MASK_WIDTH / 2;
		this._rangesX = this.pointX.map(x => [x - width, x + width]);
	}

	get widthLenUnit() {
		return ((this.canvas.width - 2 * (PADDING)) - 2 * TEXT_MARGIN) / (this.xList.length - 1);
	}

	getPointY(val) {

		const { height } = this.canvas;
		const unitHeight = height - PADDING * 2;

		return height - PADDING - (val / (lines * unit)) * unitHeight;
	}

	mousedown(evt) {
		const { offsetX, offsetY } = evt;

		this.x = offsetX;
		this.y = offsetY;
	}

	mouseup(evt) {
		const ctx = this.canvas.getContext('2d');
		const { offsetX, offsetY } = evt;

		ctx.beginPath();

		ctx.moveTo(this.x, this.y);
		ctx.lineTo(offsetX, offsetY);

		ctx.stroke();

		ctx.closePath();
	}

	@debounce(20)
	mousemove(evt) {
		const { offsetX, offsetY } = evt;
		const ctx = this.canvas.getContext('2d');
		const { width, height } = this.options;
		const [min, max] = this._maxAndMinPoint;

		ctx.clearRect(0, 0, width, height);
		this.bindHtml = null;

		for (let index = 0, len = this._rangesX.length; index < len; index++) {
			const [bx, ax] = this._rangesX[index];

			if (offsetX > bx && offsetX < ax && offsetY > min && offsetY < max) {
				this.drawTips(offsetX, offsetY, index);
				this.drawMask(ctx, this.pointX[index]);
				this.drawPoint(bx, ax, ctx, this.pointX[index]);
				return;
			}
		}
	}

	@action
	drawTips(x, y, index) {
		const list = this.options.data.map(({ list, ...props }) => ({ ...props, value: list[index] }));
		this.bindHtml = this.options.formatTip(list);
		this.tipsStyle = { top: y + 'px', left: x + 'px'};
	}

	drawPoint(bx, ax, ctx, x) {
		const list = this.points.filter(([x]) => x >= bx && x <= ax);

		// ctx.beginPath();
		// ctx.moveTo();
		// ctx.lineTo();
		// ctx.stroke();

		list.forEach(([x, y, color]) => {

			ctx.beginPath();
			ctx.arc(x, y, 5, 0, 2 * Math.PI);
			ctx.strokeStyle = color;
			ctx.stroke();
			ctx.fillStyle = '#FFF';
			ctx.fill();
			ctx.closePath();
		});
	}

	drawMask(ctx, x) {
		const [min, max] = this._maxAndMinPoint;
		ctx.fillStyle = 'rgba(102,102,102,0.1)';
		ctx.fillRect(x - MASK_WIDTH / 2, min, MASK_WIDTH, max - min);
	}


    render() {
        return (
            <section className="cm-line-chart">

                <canvas id="background-canvas"></canvas>
                <canvas id="canvas"
                        ng-mousedown="$ctrl.mousedown($event)"
                        ng-mouseup="$ctrl.mouseup($event)"
                        ng-mousemove="$ctrl.mousemove($event)"
                ></canvas>
	            <div ng-if="$ctrl.bindHtml" ng-bind-html="$ctrl.bindHtml" ng-style="$ctrl.tipsStyle" className="cm-tips-line-char"></div>
            </section>

        )
    }
}