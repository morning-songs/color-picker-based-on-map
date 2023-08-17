const divPreview = (function () {
    let dom = null;
    return function () {
        if (!dom) {
            dom = document.getElementById("divpreview");
        }
        return dom;
    }
})();

const bodyStyle = document.body.style;

function mouseFn(visibility, bgc, cursor) {
    const divPreviewStyle = divPreview().style;
    divPreviewStyle.visibility = visibility;
    divPreviewStyle.backgroundColor = bgc;
    bodyStyle.cursor = cursor;
}

// 当鼠标移出<map>时, 隐藏并重置颜色预览框, 恢复光标默认样式
function mouseOutMap() {
    mouseFn("hidden", "", "");
}

// 当鼠标移入<area>时, 显示并更新颜色预览框, 设置光标样式为小手
function mouseOverColor(hex) {
    mouseFn("visible", hex, "pointer");
}

const html5ColorPicker = (function () {
    let dom = null;
    return function () {
        if (!dom) {
            dom = document.getElementById("html5colorpicker");
        }
        return dom;
    }
})();

const enterColor = (function () {
    let dom = null;
    return function () {
        if (!dom) {
            dom = document.getElementById("entercolor");
        }
        return dom;
    }
})();

const colorHexDIV = (function () {
    let dom = null;
    return function () {
        if (!dom) {
            dom = document.getElementById("colorhexDIV");
        }
        return dom;
    }
})();

const colorNamDIV = (function () {
    let dom = null;
    return function () {
        if (!dom) {
            dom = document.getElementById("colornamDIV");
        }
        return dom;
    }
})();

const colorRgbDIV = (function () {
    let dom = null;
    return function () {
        if (!dom) {
            dom = document.getElementById("colorrgbDIV");
        }
        return dom;
    }
})();

const colorHslDIV = (function () {
    let dom = null;
    return function () {
        if (!dom) {
            dom = document.getElementById("colorhslDIV");
        }
        return dom;
    }
})();

const colorHsvDIV = (function () {
    let dom = null;
    return function () {
        if (!dom) {
            dom = document.getElementById("colorhsvDIV");
        }
        return dom;
    }
})();

const selectedHexagon = (function () {
    let dom = null;
    return function () {
        if (!dom) {
            dom = document.getElementById("selectedhexagon");
        }
        return dom;
    }
})();

const selectedColor = (function () {
    let dom = null;
    return function () {
        if (!dom) {
            dom = document.getElementById("selectedcolor");
        }
        return dom;
    }
})();

// 当选中颜色时, 更新颜色
function clickColor(hex, selftop, selfleft, html5) {
    // 颜色值变量
    let color;
    // 存储颜色值
    if (html5) {
        // 从HTML5拾色器中获得颜色值
        color = html5ColorPicker().value;
    } else {
        if (hex === 0) {
            // 从颜色值输入框中获得颜色值
            color = enterColor().value;
        } else {
            // 从参数中获得颜色值
            color = hex;
        }
    }
    // 获取tinycolor对象，颜色值转为十六进制格式
    const tinycolorObj = tinycolor(color),
        hexString = tinycolorObj.toHexString();
    // 检验颜色值的合法性, 错误的值将出示错误提示框
    if (tinycolorObj.isValid()) {
        clearWrongInput();
    } else {
        return wrongInput();
    }
    // 将颜色值以指定的格式展示到页面上
    // 展示颜色值对应的颜色名称
    colorNamDIV().innerHTML = tinycolorObj.toName() || "";
    colorHexDIV().innerHTML = hexString;
    colorRgbDIV().innerHTML = tinycolorObj.toRgbString();
    colorHslDIV().innerHTML = tinycolorObj.toHslString();
    colorHsvDIV().innerHTML = tinycolorObj.toHsvString();
    // 处理六边形选区
    const selectedHexagonStyle = selectedHexagon().style;
    if (selftop > -201 && selfleft > -1) {
        selectedHexagonStyle.top = `${selftop}px`;
        selectedHexagonStyle.left = `${selfleft}px`;
        selectedHexagonStyle.visibility = "visible";
    } else {
        divPreview().style.backgroundColor = hexString;
        selectedHexagonStyle.visibility = "hidden";
    }
    // 在颜色查看区展示选中的颜色
    selectedColor().style.backgroundColor = hexString;
    // 更新 HTML5 拾色器的值
    html5ColorPicker().value = hexString;
    // 更新亮度货柜中的颜色
    changeColor(hexString);
}

const enterColorDIV = (function () {
    let dom = null;
    return function () {
        if (!dom) {
            dom = document.getElementById("entercolorDIV");
        }
        return dom;
    }
})();

const wrongInputDIV = (function () {
    let dom = null;
    return function () {
        if (!dom) {
            dom = document.getElementById("wronginputDIV");
        }
        return dom;
    }
})();

// 清除错误提示框
function clearWrongInput() {
    enterColorDIV().className = "";
    wrongInputDIV().style.display = "none";
}

// 显示错误提示框
function wrongInput() {
    enterColorDIV().className = "has-error";
    wrongInputDIV().style.display = "block";
}

// 更新亮度货柜中的颜色
function changeColor(colorString) {
    // 更新亮度货柜
    hslLum_top(colorString);
}

const colorTable = (function () {
    let dom = null;
    return function () {
        if (!dom) {
            dom = document.getElementById("colorTable");
        }
        return dom;
    }
})();

// 更新亮度货柜
function hslLum_top(colorString) {
    // innerHTML变量, 匹配度变量
    let lumInnerHTML = "", match = false;
    // 获取最新颜色
    const hslObj = tinycolor(colorString).toHsl(),
        h = hslObj.h,
        s = hslObj.s,
        l = hslObj.l,
        arr = new Array(21),
        round = Math.round;
    // 将hsl格式的颜色按亮度以5%为一份存入亮度数组, [0%, 100%]共计21份
    for (let i = 0; i <= 20; i++) {
        arr[i] = tinycolor(`hsl(${h}, ${s}, ${i * 0.05})`);
    }
    // 翻转数组
    arr.reverse();
    // 更新innerHTML
    for (let i = 0, len = arr.length; i < len; i++) {
        const hsl_l = tinycolor(arr[i]).toHsl().l,
            hexString = tinycolor(arr[i]).toHexString(),
            l_round = round(l * 100),
            hsl_l_round = round(hsl_l * 100);
        // 根据当前颜色的亮度值去亮度数组中匹配对应的索引
        if (!match && l_round === hsl_l_round) {
            lumInnerHTML += `
                <tr><td></td><td></td><td></td></tr>
                <tr style="font-weight: bold;">
                    <td>${l_round}%</td>
                    <td style="background-color: ${hexString}; height: 4em;"></td>
                    <td>${hexString}</td>
                </tr>
                <tr><td></td><td></td><td></td></tr>
            `;
            // 更改匹配度, 表示已匹配到
            match = true;
        } else {
            // 如果实际亮度稍大于当前索引的亮度, 也视为匹配到
            if (!match && l > hsl_l) {
                lumInnerHTML += `
                    <tr><td></td><td></td><td></td></tr>
                    <tr style="font-weight: bold;">
                        <td>${l_round}%</td>
                        <td style="background-color: ${colorString}; height: 4em;"></td>
                        <td>${colorString}</td>
                    </tr>
                    <tr><td></td><td></td><td></td></tr>
                `;
                // 更改匹配度, 表示已匹配到
                match = true;
            }
            // 创建其余的亮度行
            lumInnerHTML += `
                <tr>
                    <td>${hsl_l_round}%</td>
                    <td style="background-color: ${hexString}" onclick="clickColor('${hexString}')"></td>
                    <td>${hexString}</td>
                </tr>
            `;
        }
    }
    colorTable().innerHTML = lumInnerHTML;
}

// 页面加载完成后, 测试浏览器是否支持HTML5拾色器, 不支持则隐藏它
window.onload = function () {
    const oInput = document.createElement("input");
    oInput.setAttribute("type", "color");
    if (oInput.type === "text") {
        document.getElementById("html5DIV").style.visibility = "hidden";
    }
}

// 当使用enter提交输入的颜色值时, 更新颜色值, 隐藏六边形选区
function submitOnEnter(e) {
    const keyboardKey = e.which || e.keyCode;
    if (keyboardKey === 13) {
        clickColor(0, -1, -1);
    }
}
