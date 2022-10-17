/* eslint-disable @typescript-eslint/no-unused-vars */
import Chart from 'chart.js/auto';
import { Statistic } from '../../types/http.types';
import { ChartsValue } from '../../types/statistic.types';
import { chartController } from './chart.controller';

export class ChartView {
  private showGeneralChart(
    canvasId: string,
    arrLabels: string[],
    arrData: number[],
    nameLabel: string,
    lineColor: string,
    pointsColor: string
  ): void {
    const ctx = <HTMLCanvasElement>document.querySelector(canvasId);
    ctx.getContext('2d');
    const myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: arrLabels,
        datasets: [
          {
            label: nameLabel,
            data: arrData,
            backgroundColor: [pointsColor],
            borderColor: [lineColor],
            borderWidth: 3,
          },
        ],
      },
      options: {},
    });
  }

  renderChart(statistics: Statistic): void {
    const valueChart: ChartsValue = chartController.parseStatistics(statistics);

    this.showGeneralChart(
      '#chart',
      valueChart.data,
      valueChart.newWords,
      'Количество новых слов в день',
      '#00b955',
      '#1890ff'
    );

    this.showGeneralChart(
      '#chart1',
      valueChart.data,
      valueChart.learntWords,
      'Всего изучено слов',
      'red',
      '#00b955'
    );
  }
}

export const chartView: ChartView = new ChartView();
