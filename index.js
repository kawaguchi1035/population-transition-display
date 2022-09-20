Vue.createApp({
    el: "#app",
    data() {
        return {
            apiKey: "EUVcEdOF1bm9b7heQZETPE7LaTaQrfNPdhZVCCPY",
            prefectures: [],
            populationInfo: [],
            beforeUpdateFlag: false,
            checkedFlag: false,
            getPopulationFlag: false,
            items: [],
            resasApiUrl: "",
            selectPrefName: "",
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
            this.getPopulationInfo();
            this.checkedFlag = false;
        }
    },
    updated() {
        if (this.getPopulationFlag) {
            // 都道府県別の人口情報をグラフ表示
            this.createGraph();
            this.getPopulationFlag = false;
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

        async createGraph() {
            // 年リスト、人口リスト生成
            let yearList = [];
            let populationList = [];

            this.populationInfo[0].data.forEach(function (value, index) {
                // 2030年まで10年毎に値取得 (2022/09時点:1965～2045)
                if (index % 2 == 0 && value.year <= "2030") {
                    yearList.push(value.year);
                    populationList.push(value.value);
                }
            });

            Highcharts.chart("container", {
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
                    categories: yearList,
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
                        data: Array.from(populationList),
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
            // チェックボックスにチェックがある時のみ都道府県情報取得
            if (item.checked) {
                for (let i = 0; i < this.items.length; i++) {
                    // 選択チェックボックス以外をオフ
                    if (i !== idx) {
                        this.items[i].checked = false;
                    }
                }

                // RESAS API呼び出しのURL生成
                this.resasApiUrl =
                    "https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=" +
                    String(idx + 1);

                // 選択された都道府県名を取得
                this.selectPrefName = String(item.name);
                this.checkedFlag = true;
            }
            this.$forceUpdate();
        },
    },
}).mount("#app");
