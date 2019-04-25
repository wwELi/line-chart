import React, { useState } from 'react';

export default class LineChart {

    render() {
        return (
            <section mobx-autorun class="cm-line-chart">
                <canvas id="background-canvas"></canvas>
                <canvas id="canvas"
                        ng-mousedown="$ctrl.mousedown($event)"
                        ng-mouseup="$ctrl.mouseup($event)"
                        ng-mousemove="$ctrl.mousemove($event)"
                ></canvas>
	            <div ng-if="$ctrl.bindHtml" ng-bind-html="$ctrl.bindHtml" ng-style="$ctrl.tipsStyle" class="cm-tips-line-char"></div>
            </section>

        )
    }
}