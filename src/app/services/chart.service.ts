import {UserService} from '../framework/modules/auth/user.service';
import {DataService} from '../framework/services/data.service';
import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs';
import {Chart} from 'chart.js';
// http://google.github.io/palette.js/
import * as palette from 'google-palette';
import {ChartConfiguration, LegendItem} from 'chart.js/dist/types';

export enum ChartType {
    Pie = 'pie',
    Bar = 'bar',
    StackedBar = 'stackedBar'
}

interface ChartSetting {
    chartType: ChartType;
    resultName: string;
    resultDb: any;
    options?: any;
    width?: number;
    height?: number;
    colorPalette?: string;

    backgroundColor?: any;
    title?: any;
    borderColor?: any;
    indexAxis?: any;
    animate?: any;
}

@Injectable({
    providedIn: 'root'
})

export class ChartService {

    charts = {};

    constructor(
        private dataService: DataService,
        private userService: UserService,
        private translateService: TranslateService,
    ) {
    }

    pieChart(settings: ChartSetting[]): Observable<any> {
        return new Observable(observer => {

            settings.forEach((setting, index) => {
                // PIE CHART
                const chart: any = {
                    type: setting.chartType,
                    data: {
                        labels: [],
                        datasets: [{
                            data: [],
                            backgroundColor: setting.backgroundColor,
                            borderColor: setting.borderColor,
                            borderWidth: 1
                        }],
                    },
                    options: {
                        title: {
                            display: true,
                            text: setting.title,
                            fontSize: 60,
                            lineHeight: 2
                        },
                        animation: {
                            onComplete: () => {
                                const pdf_chart = myChart.toBase64Image();
                                observer.next({name: setting.resultName, chart: pdf_chart});
                                if (index === settings.length - 1) {
                                    observer.complete();
                                }
                            }
                        },
                        responsive: false,
                        legend: {
                            position: 'bottom',
                            labels: {
                                fontSize: 40,
                                padding: 60
                            }
                        },
                        /*            segmentShowStroke : true,
                                    segmentStrokeColor : '#fff',
                                    segmentStrokeWith: 150*/
                    }
                };
                setting.resultDb.forEach(element => {
                    if (element.label) {
                        this.translateService.stream(element.label).subscribe(result => {
                            chart.data.labels.push(result + ' (' + element.data + ')');
                        });
                    } else {
                        if (element.data !== '0') {
                            chart.data.labels.push(this.translateService.instant('REPORT.AREA_VALUE_NULL_NAME') + ' (' + element.data + ')');
                        }
                    }

                    chart.data.datasets[0].data.push(element.data);
                });

                const canvas = document.createElement('canvas');
                canvas.width = setting.width ? setting.width : 1280;
                canvas.height = setting.height ? setting.height : 1024;
                const ctx = canvas.getContext('2d');
                const myChart = new Chart(ctx, chart);
            });
        });
    }

    ///////////// NEW VERSION ///////////////////////////////////////////////////////

    generateCharts(settings: ChartSetting[]): Observable<any> {
        return new Observable(observer => {

            const lastSettings = settings.length - 1;

            settings.forEach((chartSetting, index) => {
                if (chartSetting.chartType === ChartType.Bar) {
                    this.generateBarChart(chartSetting, observer, index, lastSettings);
                }
                if (chartSetting.chartType === ChartType.StackedBar) {
                    this.generateStackedBarChart(chartSetting, observer, index, lastSettings);
                }
            });
        });
    }

    generateBarChart(settings, observer, index, lastSettings) {
        const chart: any = {
            type: 'bar',
            data: this.setBackgroundColorSingleDataset(settings),
            /*            data: {
                            labels: ["Angular 10", "Angular 9", "Angular 8"],
                            datasets: [{
                                label: 'Active Angular Vesrions',
                                data: [85, 100, 82],
                                backgroundColor: ["red","blue", "orange"],
                                borderWidth: 1
                            }]
                        },*/
            options: settings.options
        };

        chart.options.animation = {
            onComplete: () => {
                this.charts[settings.resultName] = out.toBase64Image();
                if (index === lastSettings) {
                    observer.next(this.charts);
                    observer.complete();
                }
            }
        };

        const canvas = document.createElement('canvas');
        canvas.width = settings.width ? settings.width : 1280;
        canvas.height = settings.height ? settings.height : 1024;
        const ctx = canvas.getContext('2d');
        const out = new Chart(ctx, chart);
    }

    generateStackedBarChart(settings, observer, index, lastSettings) {
        const chart: any = {
            type: 'bar',
            data: this.setBackgroundColorMultiDataset(settings.resultDb, settings.colorPalette),
            options: settings.options
        };
        chart.options.animation = {
            onComplete: () => {
                this.charts[settings.resultName] = out.toBase64Image();
                if (index === lastSettings) {
                    observer.next(this.charts);
                    observer.complete();
                }
            }
        };

        const canvas = document.createElement('canvas');
        canvas.width = settings.width ? settings.width : 1280;
        canvas.height = settings.height ? settings.height : 1024;
        const ctx = canvas.getContext('2d');
        const myChart = new Chart(ctx, chart);

        // hide duplicated legends
        const legendItems = myChart.legend.legendItems;
        const uniqueLegendItems = legendItems.filter((value,index,self)=>{
            return self.findIndex(item => item.text === value.text) === index;
        });
        myChart.legend.legendItems = uniqueLegendItems;

        const out = myChart;
    }

    private setBackgroundColorSingleDataset(settings, colorPalette = 'tol-rainbow'): any {
        const backgroundColor = [];
        const borderColor = [];

        if (settings.backgroundColor) {
            // overwrite colors with settings
            settings.resultDb.datasets.forEach(dataset => {
                dataset.backgroundColor = settings.backgroundColor;
                if (settings.borderColor) {
                    dataset.borderColor = settings.borderColor;
                }
                if (settings.borderWidth) {
                    dataset.borderWidth = settings.borderWidth;
                }
                dataset.datalabels = {
                    align: 'center',
                    anchor: 'center'
                };
            });
        } else {
            // use color palette

            if (settings.colorPalette) {
                colorPalette = settings.colorPalette;
            } else {
                colorPalette = 'tol-rainbow';
            }

            palette(colorPalette, settings.resultDb.labels.length).forEach(color => {
                backgroundColor.push(this.hexToRgb('#' + color, 0.8));
                borderColor.push('#' + color);
            });

            // generate color-label assignment
            const labelColors = [];
            settings.resultDb.labels.forEach((label, index) => {
                labelColors[label] = backgroundColor[index];
            });

            // write dataset background color
            settings.resultDb.datasets.forEach(dataset => {
                dataset.backgroundColor = backgroundColor;
                dataset.borderColor = borderColor;
                if (settings.borderWidth) {
                    dataset.borderWidth = settings.borderWidth;
                }
            });
        }

        return settings.resultDb;
    }

    private setBackgroundColorMultiDataset(dbData, colorPalette = 'tol-rainbow'): any {
        // generate color palette
        const colorSet = palette(colorPalette, dbData.color_labels.length).map(hex => {
            return '#' + hex;
        });
        const colorLabels = [];

        if (dbData.color_labels) {
            dbData.color_labels.forEach((label, index) => {
                colorLabels[label] = colorSet[index];
            });
            dbData.datasets.forEach((dataset) => {
                dataset.backgroundColor = this.hexToRgb(colorLabels[dataset.label], 0.8);
                dataset.borderColor = this.hexColorLuminance(colorLabels[dataset.label], -0.5);
                dataset.borderWidth = 1;
            });
        } else {
            console.error('no color_labels in result', dbData);
        }

        return dbData;
    }

    private hexColorLuminance(hex, lum) {
        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        let rgb = '#', c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substring(i * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ('00' + c).substring(c.length);
        }
        return rgb;
    }

    private hexToRgb(hex, transparency = 1) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 'rgba(' + parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) + ', ' + transparency + ')' : null;
    }

    generateColorSet(count, colorPalette = 'tol-dv'): string[] {
        const out = [];
        const colorSet = palette(colorPalette, count).map(hex => {
            out.push(this.hexToRgb('#' + hex, 0.8));
        });
        return out;
    }

}

