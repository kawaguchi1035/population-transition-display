Vue.createApp({
    el: "#app",
    data() {
        return {
            apiKey: "EUVcEdOF1bm9b7heQZETPE7LaTaQrfNPdhZVCCPY",
            prefectures: [],
            populationInfo: [],
            yearList: [],
            chartObj: "",
            beforeUpdateFlag: false,
            checkedFlag: false,
            isUnCheck: false,
            getPopulationFlag: false,
            isFirst: true,
            items: [],
            removeTarget: 99,
            resasApiUrl: "",
            selectPrefName: "",
            populationList: [],
        };
    },
    mounted() {
        // RESAS APIで都道府県一覧を取得
        this.getPrefecturesName();
    },
    beforeUpdate() {
        if (!this.beforeUpdateFlag) {
            // チェックボックス生成用リスト生成
            this.addItems();
            this.beforeUpdateFlag = true;
        }

        if (this.checkedFlag) {
            // 都道府県別人口構成情報取得
            this.getPopulationInfo();
            this.checkedFlag = false;
        }

        // チェックが外れた場合
        if (this.isUnCheck) {
            // チェック0の場合処理せず(グラフ変形を防ぐため)
            if (this.removeTarget == 0) {
                return;
            }
            // 対象をグラフから削除する
            this.chartObj.series[this.removeTarget].remove();
            this.isUnCheck = false;
        }
    },
    updated() {
        if (this.getPopulationFlag) {
            this.getPopulationFlag = false;

            // グラフ生成用リスト作成
            this.generatePopulationInfo();

            // 都道府県別の人口情報をグラフ表示
            if (this.isFirst) {
                // 初回グラフ作成
                this.createGraph();
                this.isFirst = false;
            } else {
                // 2回目以降のグラフ描画
                this.chartObj.addSeries({
                    name: this.selectPrefName,
                    data: Array.from(this.populationList),
                });
            }
        }
    },

    methods: {
        async getPrefecturesName() {
            const resas_api =
                "https://opendata.resas-portal.go.jp/api/v1/prefectures";
            await axios
                .get(resas_api, { headers: { "X-API-KEY": this.apiKey } })
                .then((response) => {
                    // 都道府県一覧を取得
                    this.prefectures = response.data.result;
                    console.log("get prefectures name.");
                })
                .catch((error) => {
                    console.log(error);
                });
            this.$forceUpdate();
        },

        async getPopulationInfo() {
            await axios
                .get(this.resasApiUrl, {
                    headers: { "X-API-KEY": this.apiKey },
                })
                .then((response) => {
                    // 都道府県別人口構成情報取得
                    this.populationInfo = response.data.result.data;
                    this.getPopulationFlag = true;
                    console.log("get population information.");
                })
                .catch((error) => {
                    console.log(error);
                });
            this.$forceUpdate();
        },

        addItems() {
            for (let i = 0; i < this.prefectures.length; i++) {
                let prefectureDict = {};
                prefectureDict.name = this.prefectures[i].prefName;
                prefectureDict.checked = false;
                this.items.push(prefectureDict);
            }
        },

        generatePopulationInfo() {
            // 年リスト、人口リスト生成
            let tempYearList = [];
            let tempPopulationList = [];

            this.populationInfo[0].data.forEach(function (value, index) {
                // 2030年まで10年毎に値取得 (2022/09時点:1965～2045)
                if (index % 2 == 0 && value.year <= "2030") {
                    tempYearList.push(value.year);
                    tempPopulationList.push(value.value);
                }
            });

            this.yearList = tempYearList;
            this.populationList = tempPopulationList;
        },

        async createGraph() {
            console.log("createGraph");

            this.chartObj = Highcharts.chart("container", {
                chart: {
                    height: 400,
                    marginTop: 80,
                },
                title: {
                    text: "",
                },
                xAxis: {
                    title: {
                        text: "年度",
                        align: "high",
                        offset: 0,
                        rotation: 0,
                        x: 10,
                        y: 20,
                    },
                    categories: this.yearList,
                },
                yAxis: {
                    title: {
                        text: "人口数",
                        align: "high",
                        offset: 0,
                        rotation: 0,
                        x: -25,
                        y: -10,
                    },
                    labels: {
                        formatter: function () {
                            return this.value.toLocaleString();
                        },
                    },
                },
                tooltip: {
                    valueSuffix: "人",
                },
                legend: {
                    layout: "vertical",
                    align: "right",
                    verticalAlign: "middle",
                    borderWidth: 0,
                },
                series: [
                    {
                        name: this.selectPrefName,
                        data: Array.from(this.populationList),
                    },
                ],
                responsive: {
                    rules: [
                        {
                            condition: {
                                maxWidth: 479,
                            },
                            chartOptions: {
                                legend: {
                                    layout: "horizontal",
                                    align: "center",
                                    verticalAlign: "bottom",
                                },
                            },
                        },
                    ],
                },
            });
        },

        changed: function (item, idx) {
            let checkCount = 0;

            // チェックボックスにチェックがある時のみ都道府県情報取得
            if (item.checked) {
                for (let i = 0; i < this.items.length; i++) {
                    if (this.items[i].checked) {
                        checkCount = checkCount + 1;
                    }
                }

                // チェック上限制限(3つ)
                if (3 < checkCount) {
                    item.checked = false;
                    return;
                }

                // RESAS API呼び出しのURL生成
                this.resasApiUrl =
                    "https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=" +
                    String(idx + 1);

                // 選択された都道府県名を取得
                this.selectPrefName = String(item.name);
                this.checkedFlag = true;
            } else {
                // チェックボックスのチェックを外した場合
                this.isUnCheck = true;

                // チェックが外れたチェックボックスを検知
                for (let i = 0; i < this.chartObj.series.length; i++) {
                    if (this.chartObj.series[i].name == item.name) {
                        this.removeTarget = i;
                    }
                }

                // チェック0無効(グラフ変形を防ぐため)
                if (this.removeTarget == 0) {
                    item.checked = true;
                }
            }
            this.$forceUpdate();
        },
    },
}).mount("#app");
