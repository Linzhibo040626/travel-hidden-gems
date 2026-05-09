const CHINA_MAP_DATA = {
    viewBox: "0 0 1000 880",
    provinces: [
        { name: "黑龙江", d: "M700,28 L725,18 L755,16 L785,22 L810,35 L835,52 L852,72 L860,95 L856,118 L845,138 L828,152 L808,160 L788,156 L768,148 L750,140 L735,138 L720,142 L708,150 L698,142 L688,128 L682,112 L684,95 L688,78 L694,60 L700,42 Z", color: "#7ecba1" },
        { name: "吉林", d: "M735,158 L755,152 L775,156 L795,162 L810,172 L818,185 L814,200 L802,210 L785,214 L768,210 L752,202 L740,192 L734,178 L732,168 Z", color: "#f9d56e" },
        { name: "辽宁", d: "M718,210 L738,204 L758,208 L778,214 L792,224 L798,238 L794,252 L782,262 L765,266 L748,262 L732,254 L720,244 L714,232 L714,220 Z", color: "#f3a683" },
        { name: "内蒙古", d: "M415,58 L455,48 L500,42 L545,44 L585,50 L625,58 L660,68 L682,80 L688,95 L684,112 L688,128 L698,142 L708,150 L720,142 L735,138 L750,140 L740,158 L734,172 L724,185 L718,200 L710,210 L698,215 L682,212 L665,205 L648,196 L630,188 L610,182 L588,178 L565,172 L542,165 L518,158 L495,150 L472,140 L450,128 L432,115 L420,98 L415,78 Z", color: "#c7ecee" },
        { name: "新疆", d: "M48,100 L88,78 L132,65 L178,60 L225,62 L272,70 L315,82 L352,98 L378,115 L392,135 L396,158 L390,180 L378,200 L362,218 L342,232 L318,242 L290,248 L262,245 L235,238 L208,225 L182,210 L158,195 L135,178 L112,162 L92,145 L72,128 L58,112 Z", color: "#dfe6e9" },
        { name: "西藏", d: "M82,268 L125,255 L170,248 L215,245 L258,248 L298,255 L332,268 L348,285 L352,305 L345,325 L332,342 L312,355 L288,362 L262,365 L235,360 L208,352 L180,340 L155,325 L132,308 L112,292 L95,278 Z", color: "#ffeaa7" },
        { name: "青海", d: "M285,210 L318,205 L348,212 L375,222 L395,238 L402,258 L395,278 L382,295 L362,305 L340,308 L318,305 L298,295 L282,282 L272,265 L268,248 L272,230 Z", color: "#dcedc1" },
        { name: "甘肃", d: "M378,135 L405,128 L432,132 L458,140 L478,152 L488,168 L485,185 L478,200 L465,212 L448,220 L432,225 L418,228 L405,232 L395,238 L382,228 L372,215 L365,200 L362,185 L365,168 L370,152 Z", color: "#fab1a0" },
        { name: "宁夏", d: "M468,178 L482,172 L492,180 L495,192 L490,205 L480,212 L468,208 L462,198 L462,188 Z", color: "#a29bfe" },
        { name: "陕西", d: "M478,218 L498,212 L518,218 L532,230 L538,248 L535,268 L528,288 L518,305 L505,315 L490,318 L478,312 L468,298 L462,282 L458,265 L460,248 L465,232 Z", color: "#fd79a8" },
        { name: "山西", d: "M538,178 L558,172 L575,180 L582,195 L580,212 L575,228 L568,242 L558,252 L545,248 L535,238 L528,225 L528,208 L530,192 Z", color: "#e17055" },
        { name: "河北", d: "M582,162 L605,155 L625,162 L638,175 L642,192 L638,210 L630,225 L618,235 L605,238 L592,235 L582,225 L575,212 L575,195 L578,178 Z", color: "#00b894" },
        { name: "北京", d: "M608,178 L618,175 L624,182 L622,192 L615,196 L608,192 Z", color: "#e84393" },
        { name: "天津", d: "M622,195 L632,192 L636,200 L632,208 L625,210 L620,204 Z", color: "#6c5ce7" },
        { name: "山东", d: "M632,232 L655,225 L678,228 L698,238 L708,252 L705,268 L695,280 L678,285 L660,282 L645,275 L632,265 L625,252 L625,240 Z", color: "#74b9ff" },
        { name: "河南", d: "M545,268 L568,262 L592,265 L612,272 L625,282 L628,298 L622,312 L610,322 L595,328 L578,325 L562,318 L548,308 L540,295 L538,280 Z", color: "#55efc4" },
        { name: "江苏", d: "M648,278 L672,272 L692,278 L708,288 L715,302 L712,318 L702,330 L688,335 L672,332 L658,325 L648,315 L642,302 L642,288 Z", color: "#81ecec" },
        { name: "安徽", d: "M618,312 L638,305 L655,310 L668,320 L672,335 L668,350 L660,362 L648,370 L632,368 L620,360 L610,348 L608,335 L610,322 Z", color: "#ffeaa7" },
        { name: "湖北", d: "M528,318 L552,312 L575,315 L595,322 L608,332 L612,348 L605,362 L592,372 L575,378 L558,375 L542,368 L528,358 L522,342 L522,328 Z", color: "#dfe6e9" },
        { name: "四川", d: "M368,310 L398,302 L428,305 L455,312 L478,322 L492,338 L498,358 L492,378 L480,395 L462,405 L442,408 L422,402 L402,392 L385,378 L372,362 L365,342 L362,325 Z", color: "#fab1a0" },
        { name: "重庆", d: "M488,355 L508,348 L525,355 L535,368 L532,382 L522,392 L508,398 L495,395 L485,385 L482,372 Z", color: "#e17055" },
        { name: "贵州", d: "M448,415 L472,408 L495,412 L515,420 L528,432 L530,448 L525,462 L512,472 L498,478 L480,475 L465,468 L452,458 L442,445 L440,430 Z", color: "#00cec9" },
        { name: "云南", d: "M365,405 L392,398 L418,402 L442,410 L455,422 L460,440 L455,458 L445,475 L430,488 L412,495 L392,492 L372,485 L355,472 L345,455 L340,438 L345,420 Z", color: "#6c5ce7" },
        { name: "湖南", d: "M548,382 L572,375 L592,380 L608,390 L618,405 L615,422 L608,435 L595,445 L578,448 L562,445 L548,435 L538,422 L535,408 L538,392 Z", color: "#fdcb6e" },
        { name: "江西", d: "M618,375 L640,368 L658,372 L672,382 L680,398 L678,415 L672,430 L660,442 L645,448 L628,445 L615,435 L608,420 L608,405 L610,390 Z", color: "#e84393" },
        { name: "浙江", d: "M680,338 L698,332 L715,338 L728,350 L732,365 L728,380 L718,392 L705,398 L690,395 L678,385 L672,372 L672,355 L675,345 Z", color: "#a29bfe" },
        { name: "上海", d: "M718,318 L728,315 L734,322 L732,332 L725,336 L718,332 Z", color: "#fd79a8" },
        { name: "福建", d: "M668,448 L688,442 L705,448 L718,460 L722,475 L718,492 L710,505 L698,512 L682,510 L668,502 L660,488 L658,472 L660,458 Z", color: "#00b894" },
        { name: "台湾", d: "M742,462 L752,458 L762,465 L768,480 L765,498 L758,512 L748,520 L740,515 L735,500 L735,482 L738,470 Z", color: "#74b9ff" },
        { name: "广东", d: "M568,458 L592,452 L618,455 L642,460 L660,470 L668,485 L665,500 L655,512 L638,518 L618,520 L598,515 L578,508 L562,498 L555,482 L558,468 Z", color: "#55efc4" },
        { name: "广西", d: "M448,478 L472,472 L498,475 L522,480 L542,488 L555,500 L552,515 L542,525 L525,530 L505,528 L485,522 L468,512 L455,500 L448,488 Z", color: "#ffeaa7" },
        { name: "海南", d: "M545,548 L562,542 L575,548 L578,562 L572,575 L560,580 L548,575 L542,562 Z", color: "#81ecec" },
        { name: "香港", d: "M648,518 L656,515 L660,520 L657,526 L650,525 Z", color: "#fd79a8" },
        { name: "澳门", d: "M638,522 L644,520 L646,525 L643,529 L638,527 Z", color: "#e17055" }
    ],
    seas: {
        coastline: "M798,238 L808,255 L815,272 L818,290 L815,308 L808,325 L798,340 L785,355 L772,368 L758,378 L745,390 L735,402 L728,415 L722,430 L718,445 L722,460 L728,472 L732,485 L728,500 L720,512 L710,522 L698,530 L685,535 L672,538 L658,535 L645,530 L632,525 L618,528 L605,532 L592,535 L578,538 L565,542 L555,548 L548,555 L542,542 L538,530 L535,518",
        nineDashLine: [
            "M680,545 L685,560 L688,575",
            "M692,585 L698,600 L702,615",
            "M705,625 L708,642 L705,658",
            "M700,668 L692,682 L682,695",
            "M672,705 L658,715 L642,722",
            "M628,728 L612,732 L595,730",
            "M580,725 L565,718 L552,708",
            "M542,698 L535,685 L532,670",
            "M532,655 L535,640 L540,625"
        ],
        islands: [
            { name: "东沙群岛", x: 698, y: 565 },
            { name: "西沙群岛", x: 648, y: 648 },
            { name: "中沙群岛", x: 672, y: 668 },
            { name: "南沙群岛", x: 635, y: 720 },
            { name: "黄岩岛", x: 695, y: 648 }
        ]
    }
};

function renderChinaMap(container) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", CHINA_MAP_DATA.viewBox);
    svg.setAttribute("class", "china-map-svg");
    svg.id = "chinaMapSvg";

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute("id", "provinceShadow");
    filter.innerHTML = '<feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.15"/>';
    defs.appendChild(filter);
    svg.appendChild(defs);

    const seaGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    seaGroup.setAttribute("class", "sea-group");

    const seaBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    seaBg.setAttribute("x", "520");
    seaBg.setAttribute("y", "535");
    seaBg.setAttribute("width", "200");
    seaBg.setAttribute("height", "220");
    seaBg.setAttribute("rx", "8");
    seaBg.setAttribute("fill", "#e8f4fd");
    seaBg.setAttribute("stroke", "#b8d4e8");
    seaBg.setAttribute("stroke-width", "1.5");
    seaGroup.appendChild(seaBg);

    const seaTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
    seaTitle.setAttribute("x", "620");
    seaTitle.setAttribute("y", "558");
    seaTitle.setAttribute("text-anchor", "middle");
    seaTitle.setAttribute("font-size", "12");
    seaTitle.setAttribute("fill", "#2980b9");
    seaTitle.setAttribute("font-weight", "bold");
    seaTitle.textContent = "南海诸岛";
    seaGroup.appendChild(seaTitle);

    CHINA_MAP_DATA.seas.nineDashLine.forEach(d => {
        const dashPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        dashPath.setAttribute("d", d);
        dashPath.setAttribute("fill", "none");
        dashPath.setAttribute("stroke", "#2980b9");
        dashPath.setAttribute("stroke-width", "2");
        dashPath.setAttribute("stroke-dasharray", "6,4");
        dashPath.setAttribute("stroke-linecap", "round");
        seaGroup.appendChild(dashPath);
    });

    CHINA_MAP_DATA.seas.islands.forEach(island => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", island.x);
        circle.setAttribute("cy", island.y);
        circle.setAttribute("r", "4");
        circle.setAttribute("fill", "#27ae60");
        circle.setAttribute("stroke", "#FFFFFF");
        circle.setAttribute("stroke-width", "1.5");
        seaGroup.appendChild(circle);

        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", island.x);
        label.setAttribute("y", island.y + 14);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("font-size", "8");
        label.setAttribute("fill", "#2c3e50");
        label.textContent = island.name;
        seaGroup.appendChild(label);
    });

    svg.appendChild(seaGroup);

    CHINA_MAP_DATA.provinces.forEach(province => {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", province.d);
        path.setAttribute("data-province", province.name);
        path.setAttribute("class", "province-path");
        path.setAttribute("fill", province.color);
        path.setAttribute("filter", "url(#provinceShadow)");

        path.addEventListener("mouseenter", (e) => {
            showTooltip(e, province.name);
        });
        path.addEventListener("mouseleave", hideTooltip);
        path.addEventListener("click", () => {
            selectProvince(province.name);
        });

        svg.appendChild(path);
    });

    container.innerHTML = '';
    container.appendChild(svg);

    const tooltip = document.createElement("div");
    tooltip.id = "mapTooltip";
    tooltip.className = "map-tooltip";
    container.appendChild(tooltip);
}

function showTooltip(e, name) {
    const tooltip = document.getElementById("mapTooltip");
    if (!tooltip) return;
    tooltip.textContent = name;
    tooltip.style.display = "block";
    const rect = e.target.closest('.map-container').getBoundingClientRect();
    tooltip.style.left = (e.clientX - rect.left + 10) + "px";
    tooltip.style.top = (e.clientY - rect.top - 30) + "px";
}

function hideTooltip() {
    const tooltip = document.getElementById("mapTooltip");
    if (tooltip) tooltip.style.display = "none";
}

function selectProvince(name) {
    document.querySelectorAll('.province-path').forEach(p => p.classList.remove('active'));
    document.querySelector(`[data-province="${name}"]`)?.classList.add('active');

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = name;
    loadPosts();
    switchView('posts');

    showToast(`正在查看：${name}`, 'success');
}