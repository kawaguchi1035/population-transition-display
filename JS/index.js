Vue.createApp({
    el: "#app",
    data() {
        return {
            message: "test test",
            prefectures: [],
        };
    },
    mounted() {
        // RESAS APIで都道府県名一覧を取得
        var resas_api =
            "https://opendata.resas-portal.go.jp/api/v1/prefectures";
        var api_key = "EUVcEdOF1bm9b7heQZETPE7LaTaQrfNPdhZVCCPY";
        axios
            .get(resas_api, { headers: { "X-API-KEY": api_key } })
            .then((response) => console.log(response.data.result))
            .catch((error) => console.log(error));
    },
}).mount("#app");
