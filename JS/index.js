Vue.createApp({
    el: "#app",
    data() {
        return {
            prefectures: [],
            checkbox: "",
        };
    },
    created() {
        // RESAS APIで都道府県一覧を取得
        this.getPrefectures();
    },
    beforeUpdate() {
        // チェックボックス生成
        this.createCheckbox();
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
    },
}).mount("#app");
