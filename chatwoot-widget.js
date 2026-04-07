(function () {
    const script = document.createElement("script");
    script.src = "https://chatwoot.synaptim.com/packs/js/sdk.js";
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
        window.chatwootSDK.run({
            websiteToken: "VUq4nVcuJZJUcP6LXhriDvNU",
            baseUrl: "https://chatwoot.synaptim.com",
            type: "expanded_bubble",
            position: "left",
            locale: "en",
            hideMessageBubble: false,
        });
    };
})();
