const datosReales = [
    { x: 31, y: 14 },
    { x: 1, y: 3 },
    { x: 2, y: 10 },
    { x: 3, y: 26 },
    { x: 4, y: 11 },
    { x: 7, y: 32 },
    { x: 8, y: 10 },
    { x: 9, y: 34 },
    { x: 10, y: 22 },
    { x: 11, y: 7 }
];

function calcularRegresion(datos) {

    const n = datos.length;

    let sumaX = 0;
    let sumaY = 0;
    let sumaXY = 0;
    let sumaX2 = 0;
    let sumaY2 = 0;

    datos.forEach(d => {
        sumaX += d.x;
        sumaY += d.y;
        sumaXY += d.x * d.y;
        sumaX2 += d.x * d.x;
        sumaY2 += d.y * d.y;
    });

    const mediaX = sumaX / n;
    const mediaY = sumaY / n;

    const pendiente =
        (n * sumaXY - sumaX * sumaY) /
        (n * sumaX2 - sumaX * sumaX);

    const intercepto =
        mediaY - pendiente * mediaX;

    let ssTotal = 0;
    let ssResidual = 0;

    datos.forEach(d => {

        const predicho =
            pendiente * d.x + intercepto;

        ssTotal += Math.pow(
            d.y - mediaY,
            2
        );

        ssResidual += Math.pow(
            d.y - predicho,
            2
        );
    });

    const r2 =
        1 - (ssResidual / ssTotal);

    return {
        pendiente,
        intercepto,
        r2,
        n
    };
}

const modelo =
    calcularRegresion(datosReales);

let xActual = 20;


function inicializarUI() {

    const signo =
        modelo.intercepto >= 0 ? '+' : '-';

    document.getElementById('ecuacion')
        .textContent =
        `Y = ${modelo.pendiente.toFixed(3)} X ${signo} ${Math.abs(modelo.intercepto).toFixed(3)}`;

    document.getElementById('valor-pendiente')
        .textContent =
        modelo.pendiente.toFixed(3);

    document.getElementById('valor-intercepto')
        .textContent =
        modelo.intercepto.toFixed(3);

    document.getElementById('valor-r2')
        .textContent =
        modelo.r2.toFixed(3);

    document.getElementById('valor-n')
        .textContent =
        modelo.n;

    document.getElementById('interpretacion')
        .innerHTML =
        generarInterpretacion();

    const maxX =
        Math.max(...datosReales.map(d => d.x)) + 10;

    document.getElementById('slider-x')
        .max = maxX;

    generarEscenarios();
    dibujarGrafica();
    llenarTabla();
    actualizarPrediccion();
}


function generarInterpretacion() {

    const m = modelo.pendiente;
    const b = modelo.intercepto;
    const r2 = modelo.r2;

    let calidadR2 = '';

    if (r2 >= 0.7)
        calidadR2 = 'fuerte';
    else if (r2 >= 0.4)
        calidadR2 = 'moderada';
    else if (r2 >= 0.2)
        calidadR2 = 'débil';
    else
        calidadR2 = 'muy débil';

    return `
        <strong>📖 Interpretación:</strong><br>
        • La pendiente (${m.toFixed(3)})
        indica que por cada minuto adicional,
        el conteo de residuos
        ${m >= 0 ? 'aumenta' : 'disminuye'}
        en promedio ${Math.abs(m).toFixed(3)} unidades.<br>

        • El intercepto (${b.toFixed(3)})
        representa el conteo estimado
        cuando X = 0 min.<br>

        • El R² = ${r2.toFixed(3)}
        indica una relación
        <strong>${calidadR2}</strong>
        entre el tiempo y el conteo.
    `;
}


function actualizarPrediccion() {

    xActual =
        parseInt(
            document.getElementById('slider-x').value
        );

    const yPredicho =
        modelo.pendiente * xActual +
        modelo.intercepto;

    const yRedondeado =
        Math.max(
            0,
            Math.round(yPredicho)
        );

    document.getElementById('x-display')
        .textContent =
        xActual + ' min';

    document.getElementById('y-display')
        .textContent =
        yRedondeado;

    let contexto = '';

    if (xActual <= 5)
        contexto =
            '🟢 Inicio del descanso. Baja acumulación esperada.';
    else if (xActual <= 15)
        contexto =
            '🟡 Mitad del descanso. Acumulación moderada.';
    else if (xActual <= 25)
        contexto =
            '🟠 Mayor acumulación de residuos.';
    else
        contexto =
            '🔴 Alto volumen de residuos. Momento crítico.';

    document.getElementById('contexto')
        .innerHTML =
        `<strong>Contexto:</strong>
        jornada mañana, 1000 personas.<br>
        ${contexto}`;

    document.querySelectorAll(
        '.escenario-card'
    ).forEach(card => {

        card.classList.toggle(
            'activo',
            parseInt(card.dataset.x) === xActual
        );

    });

    dibujarGrafica();
}


function generarEscenarios() {

    const escenarios = [
        {
            x: 5,
            nombre: 'Inicio',
            emoji: '🚀'
        },
        {
            x: 10,
            nombre: 'Cuarto',
            emoji: '⏱️'
        },
        {
            x: 15,
            nombre: 'Mitad',
            emoji: '⏳'
        },
        {
            x: 20,
            nombre: 'Jornada',
            emoji: '🎯'
        },
        {
            x: 30,
            nombre: 'Extendido',
            emoji: '⚠️'
        }
    ];

    const contenedor =
        document.getElementById('escenarios');

    contenedor.innerHTML =
        escenarios.map(e => {

            const yPred =
                Math.max(
                    0,
                    Math.round(
                        modelo.pendiente * e.x +
                        modelo.intercepto
                    )
                );

            return `
                <div
                    class="escenario-card"
                    data-x="${e.x}"
                    onclick="irAEscenario(${e.x})">

                    <div class="nombre">
                        ${e.emoji} ${e.nombre}
                    </div>

                    <div class="x-mini">
                        ${e.x} min
                    </div>

                    <div class="y-mini">
                        ≈ ${yPred} residuos
                    </div>

                </div>
            `;

        }).join('');
}


function irAEscenario(x) {

    document.getElementById('slider-x')
        .value = x;

    actualizarPrediccion();
}


function resetearSlider() {

    irAEscenario(20);

}


function dibujarGrafica() {

    const canvas =
        document.getElementById('grafica');

    const ctx =
        canvas.getContext('2d');

    const W = canvas.width;
    const H = canvas.height;

    const padding = 55;

    ctx.clearRect(
        0,
        0,
        W,
        H
    );

    const xs =
        datosReales.map(d => d.x);

    const ys =
        datosReales.map(d => d.y);

    const xMax =
        Math.max(...xs) + 5;

    const yMax =
        Math.max(...ys) + 5;

    ctx.fillStyle = '#fafafa';

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    ctx.strokeStyle = '#e9ecef';

    ctx.lineWidth = 1;

    const gridCols = 7;
    const gridRows = 6;

    for (
        let i = 0;
        i <= gridCols;
        i++
    ) {

        const x =
            padding +
            (i / gridCols) *
            (W - 2 * padding);

        ctx.beginPath();

        ctx.moveTo(
            x,
            padding
        );

        ctx.lineTo(
            x,
            H - padding
        );

        ctx.stroke();
    }

    for (
        let i = 0;
        i <= gridRows;
        i++
    ) {

        const y =
            padding +
            (i / gridRows) *
            (H - 2 * padding);

        ctx.beginPath();

        ctx.moveTo(
            padding,
            y
        );

        ctx.lineTo(
            W - padding,
            y
        );

        ctx.stroke();
    }

    ctx.strokeStyle = '#2c3e50';

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
        padding,
        padding
    );

    ctx.lineTo(
        padding,
        H - padding
    );

    ctx.lineTo(
        W - padding,
        H - padding
    );

    ctx.stroke();

    ctx.fillStyle = '#2c3e50';

    ctx.font =
        'bold 13px Segoe UI';

    ctx.textAlign = 'center';

    ctx.fillText(
        'Tiempo X (minutos)',
        W / 2,
        H - 15
    );

    ctx.save();

    ctx.translate(
        18,
        H / 2
    );

    ctx.rotate(
        -Math.PI / 2
    );

    ctx.fillText(
        'Conteo Y (residuos)',
        0,
        0
    );

    ctx.restore();

    const toPX = x =>
        padding +
        (x / xMax) *
        (W - 2 * padding);

    const toPY = y =>
        H -
        padding -
        (y / yMax) *
        (H - 2 * padding);

    ctx.strokeStyle = '#e74c3c';

    ctx.lineWidth = 3;

    ctx.beginPath();

    const x0 = 0;
    const x1 = xMax;

    const y0 =
        modelo.pendiente *
        x0 +
        modelo.intercepto;

    const y1 =
        modelo.pendiente *
        x1 +
        modelo.intercepto;

    ctx.moveTo(
        toPX(x0),
        toPY(y0)
    );

    ctx.lineTo(
        toPX(x1),
        toPY(y1)
    );

    ctx.stroke();

    datosReales.forEach(d => {

        const px =
            toPX(d.x);

        const py =
            toPY(d.y);

        ctx.beginPath();

        ctx.arc(
            px,
            py,
            6,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            '#3498db';

        ctx.fill();

    });

    const yPred =
        modelo.pendiente *
        xActual +
        modelo.intercepto;

    if (xActual <= xMax) {

        const px =
            toPX(xActual);

        const py =
            toPY(
                Math.max(
                    0,
                    yPred
                )
            );

        ctx.setLineDash([
            5,
            5
        ]);

        ctx.strokeStyle =
            '#27ae60';

        ctx.beginPath();

        ctx.moveTo(
            px,
            H - padding
        );

        ctx.lineTo(
            px,
            py
        );

        ctx.stroke();

        ctx.setLineDash([]);

        ctx.beginPath();

        ctx.arc(
            px,
            py,
            8,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            '#27ae60';

        ctx.fill();

        ctx.strokeStyle =
            'white';

        ctx.lineWidth = 3;

        ctx.stroke();

        ctx.fillStyle =
            '#27ae60';

        ctx.font =
            'bold 12px Segoe UI';

        ctx.fillText(
            `(${xActual}, ${Math.round(yPred)})`,
            px,
            py - 18
        );
    }
}


function llenarTabla() {

    const tbody =
        document.getElementById(
            'tabla-datos'
        );

    const ordenados =
        [...datosReales].sort(
            (a, b) => a.x - b.x
        );

    tbody.innerHTML =
        ordenados.map(d => {

            const predicho =
                modelo.pendiente *
                d.x +
                modelo.intercepto;

            const residuo =
                d.y - predicho;

            return `
                <tr>

                    <td>
                        <strong>${d.x}</strong> min
                    </td>

                    <td>
                        ${d.y}
                    </td>

                    <td>
                        ${predicho.toFixed(2)}
                    </td>

                    <td>
                        ${residuo >= 0 ? '+' : ''}
                        ${residuo.toFixed(2)}
                    </td>

                </tr>
            `;

        }).join('');
}


function exportarReporte() {

    let txt = '';

    txt +=
        'REPORTE DEL SIMULADOR - PCO RETO 4\n';

    txt +=
        'Colaboradores del Planeta - IED Venecia 1102\n\n';

    txt +=
        `Fecha: ${new Date().toLocaleString()}\n`;

    txt +=
        `Contexto: Jornada mañana · 1000 personas · Descanso 20 min\n\n`;

    txt +=
        'MODELO MATEMÁTICO\n';

    txt +=
        `Ecuación: Y = ${modelo.pendiente.toFixed(4)} X ${modelo.intercepto >= 0 ? '+' : '-'} ${Math.abs(modelo.intercepto).toFixed(4)}\n`;

    txt +=
        `Pendiente: ${modelo.pendiente.toFixed(4)}\n`;

    txt +=
        `Intercepto: ${modelo.intercepto.toFixed(4)}\n`;

    txt +=
        `R²: ${modelo.r2.toFixed(4)}\n`;

    txt +=
        `Número de registros: ${modelo.n}\n\n`;

    txt +=
        'ESCENARIOS\n';

    [5, 10, 15, 20, 30].forEach(x => {

        const y =
            Math.max(
                0,
                Math.round(
                    modelo.pendiente * x +
                    modelo.intercepto
                )
            );

        txt +=
            `X = ${x} min → Y ≈ ${y} residuos\n`;
    });

    const blob =
        new Blob(
            [txt],
            {
                type:
                    'text/plain;charset=utf-8'
            }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement('a');

    a.href = url;

    a.download =
        `reporte-PCO-${Date.now()}.txt`;

    a.click();

    URL.revokeObjectURL(url);
}


function mostrarAyuda() {

    alert(
        '📚 CÓMO USAR ESTE SIMULADOR\n\n' +
        '1. Captura la gráfica y la ecuación.\n\n' +
        '2. Copia la ecuación en tu tabla.\n\n' +
        '3. Usa los escenarios X=5, 10, 15, 20 y 30.\n\n' +
        '4. Exporta el reporte como evidencia.\n\n' +
        '5. Puedes subir este HTML a Drive.'
    );
}


document
    .getElementById('slider-x')
    .addEventListener(
        'input',
        actualizarPrediccion
    );

window.addEventListener(
    'load',
    inicializarUI
);