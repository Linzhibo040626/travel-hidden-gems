const CHINA_MAP_DATA = {
    viewBox: "0 0 600 500",
    provinces: [
        { name: "黑龙江", d: "M420,30 L460,25 L490,40 L500,70 L490,100 L470,110 L440,100 L420,80 L410,50 Z" },
        { name: "吉林", d: "M440,100 L470,110 L490,120 L485,140 L460,150 L435,140 L425,120 Z" },
        { name: "辽宁", d: "M425,140 L460,150 L470,165 L460,180 L435,185 L415,170 L410,155 Z" },
        { name: "内蒙古", d: "M250,40 L310,30 L370,35 L410,50 L420,80 L425,120 L415,140 L390,150 L350,140 L300,130 L260,110 L240,90 L235,60 Z" },
        { name: "新疆", d: "M30,60 L100,45 L160,55 L200,80 L210,120 L200,160 L170,190 L120,200 L70,190 L35,160 L20,120 L25,80 Z" },
        { name: "西藏", d: "M50,210 L120,200 L170,210 L210,230 L220,270 L200,300 L150,310 L100,300 L60,280 L45,250 Z" },
        { name: "青海", d: "M170,190 L210,180 L250,190 L270,220 L260,250 L230,260 L200,250 L180,230 Z" },
        { name: "甘肃", d: "M210,140 L250,130 L290,140 L310,160 L300,180 L270,190 L250,190 L230,180 L210,160 Z" },
        { name: "宁夏", d: "M290,140 L310,135 L320,150 L315,165 L300,170 L290,160 Z" },
        { name: "陕西", d: "M300,170 L320,165 L340,175 L345,210 L335,240 L315,245 L300,230 L295,200 Z" },
        { name: "山西", d: "M340,140 L360,135 L370,155 L365,180 L350,190 L340,175 L335,155 Z" },
        { name: "河北", d: "M370,130 L395,125 L405,145 L400,170 L385,180 L370,175 L365,155 Z" },
        { name: "北京", d: "M385,140 L395,138 L398,148 L392,152 L385,150 Z" },
        { name: "天津", d: "M398,148 L406,146 L408,156 L402,158 L398,155 Z" },
        { name: "山东", d: "M400,170 L430,165 L450,175 L445,195 L420,200 L400,195 L395,180 Z" },
        { name: "河南", d: "M345,195 L380,190 L400,200 L395,225 L375,235 L350,230 L340,215 Z" },
        { name: "湖北", d: "M330,245 L365,240 L385,250 L380,275 L360,285 L335,280 L325,265 Z" },
        { name: "安徽", d: "M385,215 L410,210 L420,235 L415,260 L395,265 L380,255 L378,235 Z" },
        { name: "江苏", d: "M415,195 L440,190 L455,205 L450,225 L430,235 L415,230 L410,210 Z" },
        { name: "上海", d: "M450,225 L460,222 L462,232 L455,235 L450,230 Z" },
        { name: "浙江", d: "M430,240 L450,235 L460,250 L455,275 L440,280 L425,270 L420,250 Z" },
        { name: "江西", d: "M385,270 L410,265 L425,280 L420,310 L400,320 L380,310 L375,290 Z" },
        { name: "福建", d: "M425,285 L450,280 L465,295 L460,325 L440,335 L425,320 L420,300 Z" },
        { name: "台湾", d: "M470,310 L480,305 L488,320 L485,345 L475,355 L468,340 L465,320 Z" },
        { name: "湖南", d: "M335,285 L365,280 L380,295 L375,325 L355,335 L335,325 L325,305 Z" },
        { name: "广东", d: "M350,340 L385,335 L410,345 L415,370 L395,380 L365,378 L345,365 Z" },
        { name: "广西", d: "M290,340 L325,335 L350,345 L348,370 L330,380 L300,375 L285,360 Z" },
        { name: "海南", d: "M330,395 L350,392 L355,410 L345,420 L330,415 L325,405 Z" },
        { name: "贵州", d: "M280,290 L310,285 L330,295 L325,320 L305,330 L285,325 L275,310 Z" },
        { name: "云南", d: "M230,300 L270,295 L285,315 L280,350 L260,370 L235,365 L220,340 L225,315 Z" },
        { name: "四川", d: "M230,230 L270,225 L295,240 L300,275 L280,290 L255,285 L235,270 L225,250 Z" },
        { name: "重庆", d: "M295,255 L320,250 L330,265 L325,285 L310,290 L295,280 Z" },
        { name: "香港", d: "M400,375 L408,373 L410,380 L405,383 L400,380 Z" },
        { name: "澳门", d: "M390,380 L396,378 L397,384 L393,386 L390,383 Z" }
    ]
};

function renderChinaMap(container) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", CHINA_MAP_DATA.viewBox);
    svg.setAttribute("class", "china-map-svg");
    svg.id = "chinaMapSvg";

    CHINA_MAP_DATA.provinces.forEach(province => {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", province.d);
        path.setAttribute("data-province", province.name);
        path.setAttribute("class", "province-path");

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
