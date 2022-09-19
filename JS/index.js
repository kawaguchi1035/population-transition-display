Vue.createApp({
    el: "#app",
    data() {
        return {
            prefectures: [],
            changeRate: [],
            checkbox: "",
        };
    },
    mounted() {
        // RESAS APIで都道府県一覧を取得
        this.getPrefectures();
        // RESAS APIで都道府県数別人口構成情報を取得
        this.getPopulationChangeRate();
    },
    beforeUpdate() {
        // チェックボックス生成
        this.createCheckbox();
        // グラフ表示
        this.createGraph();
    },
    methods: {
        async getPrefectures() {
            const resas_api =
                "https://opendata.resas-portal.go.jp/api/v1/prefectures";
            const api_key = "EUVcEdOF1bm9b7heQZETPE7LaTaQrfNPdhZVCCPY";
            await axios
                .get(resas_api, { headers: { "X-API-KEY": api_key } })
                .then((response) => {
                    // 都道府県一覧を取得
                    this.prefectures = response.data.result;
                    console.log("get prefectures information.");
                })
                .catch((error) => {
                    console.log(error);
                });
        },

        async getPopulationChangeRate() {
            // TODO 選択された都道府県情報を取得するよう変更 以下は東京都を指定
            const resas_api =
                "https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=11";
            const api_key = "EUVcEdOF1bm9b7heQZETPE7LaTaQrfNPdhZVCCPY";
            await axios
                .get(resas_api, { headers: { "X-API-KEY": api_key } })
                .then((response) => {
                    // 都道府県別人口構成情報取得
                    this.changeRate = response.data.result.data;
                    console.log("get population change rate information.");
                })
                .catch((error) => {
                    console.log(error);
                });
            this.$forceUpdate();
        },

        createCheckbox() {
            const split = 4;
            let gridRowCount = 1;

            for (let i = 0; i < this.prefectures.length; i++) {
                // チェックボックス4つ毎に改行
                if (i !== 0 && i % split == 0) {
                    gridRowCount = gridRowCount + 1;
                }
                // グリッドレイアウト設定
                this.checkbox =
                    this.checkbox +
                    "<div style='grid-column: " +
                    (i + 1) +
                    " grid-row: " +
                    gridRowCount +
                    "'" +
                    ">";
                this.checkbox =
                    this.checkbox +
                    "<input type='checkbox'>" +
                    "<label>" +
                    this.prefectures[i].prefName +
                    "</label>";
                this.checkbox = this.checkbox + "</div>";
            }
        },

        createGraph() {
            // 年リスト、人口リスト生成
            let yearList = [];
            let populationList = [];
            this.changeRate[0].data.forEach(function (value, index) {
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
                        y: 10,
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
                        // format: "{value:.2f}",
                        formatter: function () {
                            return this.value.toLocaleString();
                        },
                    },
                },
                tooltip: {
                    valueSuffix: "万円",
                },
                legend: {
                    layout: "vertical",
                    align: "right",
                    verticalAlign: "middle",
                    borderWidth: 0,
                },
                series: [
                    {
                        // TODO チェックボックス押下された都道府県情報を設定
                        name: this.prefectures[12].prefName,
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
    },
}).mount("#app");
