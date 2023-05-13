const SOURCES = ["calendar.html", "calendar.js"];
const HOT_RELOAD_INDEX_KEY = "hot_reload_index";
let HOT_RELOAD_INTERVAL_HANDLER = null;

$(document).ready(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("hot_reload") === "false") {
        console.log("Hot reload is disabled");
        return;
    }
    initHotReload();
});

// Taken from https://stackoverflow.com/a/52171480
function cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function initHotReload() {
    const index = new Map(JSON.parse(localStorage.getItem(HOT_RELOAD_INDEX_KEY) || "[]"));

    if (HOT_RELOAD_INTERVAL_HANDLER !== null) {
        clearInterval(HOT_RELOAD_INTERVAL_HANDLER);
    }

    HOT_RELOAD_INTERVAL_HANDLER = setInterval(() => {
        for (const source of SOURCES) {
            $.get({
                url: source,
                dataType: "text",
                success(data) {
                    try {
                        const hash = cyrb53(data);
                        const oldHash = index.get(source);
                        index.set(source, hash);

                        if (oldHash && hash != oldHash) {
                            console.log("Reloading...");
                            localStorage.setItem(HOT_RELOAD_INDEX_KEY, JSON.stringify([...index.entries()]));
                            location.href = location.href;
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
            });
        }
    }, 1000);
}