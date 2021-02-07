const https = require('follow-redirects').https;
const fs = require('fs');
const path = require('path');

function ensureFileDir(dest) {
    const d = path.dirname(dest);
    if (!fs.existsSync(d)) {
        fs.mkdirSync(d, {recursive: true});
    }
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        ensureFileDir(dest);
        const file = fs.createWriteStream(dest);
        console.info("download: " + url);
        https.get(url, function (response) {
            response.pipe(file);
            file.on('finish', () => {
                console.info("saved: ", dest);
                resolve();
            }).on('error', (e) => {
                console.error("file save error:", e);
                reject(e);
            })
        }).on('error', (e) => {
            console.error("https request error:", e);
            reject(e);
        });
    });
}

function downloadFiles(props) {
    const srcBaseUrl = props.srcBaseUrl;
    const destPath = props.destPath;
    const fileMap = props.fileMap ?? {};
    const fileList = props.fileList ?? [];

    const tasks = [];

    for (const src of Object.keys(fileMap)) {
        const dest = fileMap[src] ?? src;
        const destFilePath = path.join(destPath, dest);
        const url = path.join(srcBaseUrl, src);
        tasks.push(downloadFile(url, destFilePath));
    }

    for (const src of fileList) {
        const destFilePath = path.join(destPath, src);
        const url = path.join(srcBaseUrl, src);
        tasks.push(downloadFile(url, destFilePath));
    }

    return Promise.all(tasks);
}

async function setup_imgui() {
    console.info("imgui");
    await downloadFiles({
        srcBaseUrl: "https://github.com/ocornut/imgui/raw/master",
        destPath: "../imgui/src",
        fileList: [
            "imconfig.h",
            "imgui_demo.cpp",
            "imgui.cpp",
            "imgui.h",
            "imgui_draw.cpp",
            "imgui_internal.h",
            "imgui_widgets.cpp",
            "imgui_tables.cpp",
            "imstb_textedit.h",
        ],
        fileMap: {
            "misc/cpp/imgui_stdlib.h": "imgui_stdlib.h",
            "misc/cpp/imgui_stdlib.cpp": "imgui_stdlib.cpp"
        }
    });

    let imguiconfig = fs.readFileSync("../imgui/src/imconfig.h", "utf8");
    imguiconfig = `#define IMGUI_STB_TRUETYPE_FILENAME   <stb_truetype.h>
#define IMGUI_STB_RECT_PACK_FILENAME  <stb_rect_pack.h>
` + imguiconfig;
    fs.writeFileSync("../imgui/src/imconfig.h", imguiconfig);
}

async function setup_miniaudio() {
    console.info("miniaudio");
    //const branch = "master";
    const branch = "dev";
    await downloadFiles({
        srcBaseUrl: `https://github.com/mackron/miniaudio/raw/${branch}`,
        destPath: "../miniaudio/src",
        fileList: [
            "miniaudio.h"
        ],
        fileMap: {
            "research/miniaudio_engine.h": "miniaudio_engine.h"
        }
    });
}

async function setup_pugixml() {
    console.info("pugixml");
    await downloadFiles({
        srcBaseUrl: "https://github.com/zeux/pugixml/raw/master",
        destPath: "../pugixml",
        fileList: [
            "src/pugiconfig.hpp",
            "src/pugixml.hpp",
            "src/pugixml.cpp",
        ]
    });
}

async function setup_stb() {
    console.info("stb");
    await downloadFiles({
        srcBaseUrl: "https://github.com/nothings/stb/raw/master",
        destPath: "../stb/src",
        fileList: [
            "stb_image.h",
            "stb_image_write.h",
            "stb_rect_pack.h",
            "stb_textedit.h",
            "stb_truetype.h",
        ]
    });
}

async function setup_sokol() {
    console.info("sokol");
    await downloadFiles({
        srcBaseUrl: "https://github.com/floooh/sokol/raw/master",
        destPath: "../sokol/src",
        fileList: [
            "sokol_app.h",
            "sokol_args.h",
            "sokol_audio.h",
            "sokol_fetch.h",
            "sokol_gfx.h",
            "sokol_glue.h",
            "sokol_time.h",
            "util/sokol_debugtext.h",
            "util/sokol_fontstash.h",
            "util/sokol_gfx_imgui.h",
            "util/sokol_gl.h",
            "util/sokol_imgui.h",
            "util/sokol_memtrack.h",
            "util/sokol_shape.h",
        ]
    });
}

async function setup_sokol_shdc() {
    console.info("sokol-shdc binaries");
    await downloadFiles({
        srcBaseUrl: "https://github.com/floooh/sokol-tools-bin/raw/master",
        destPath: "../sokol",
        fileList: [
            "bin/linux/sokol-shdc",
            "bin/osx/sokol-shdc",
            "bin/win32/sokol-shdc.exe",
        ]
    });
}

async function setup_miniz() {
    console.info("miniz");
    await downloadFiles({
        srcBaseUrl: "https://github.com/richgel999/miniz/raw/master",
        destPath: "../miniz/src",
        fileList: [
            "miniz_common.h",
            "miniz.h",
            "miniz.c",
            "miniz_tinfl.h",
            "miniz_tinfl.c",
            "miniz_tdef.h",
            "miniz_tdef.c",
            "miniz_zip.h",
            "miniz_zip.c",
        ]
    });

    await fs.promises.writeFile("../miniz/src/miniz_export.h", `
#ifndef MINIZ_EXPORT
#define MINIZ_EXPORT
#endif
`);

    let miniz_zip = fs.readFileSync("../miniz/src/miniz_zip.c", "utf8");
    const miniz_zip_patched = miniz_zip.replaceAll(`cdir_ofs = MZ_READ_LE32(pBuf + MZ_ZIP_ECDH_CDIR_OFS_OFS);`,
        `
    // patch
    cdir_ofs = MZ_READ_LE32(pBuf + MZ_ZIP_ECDH_CDIR_OFS_OFS);
    if(cdir_ofs + cdir_size > pZip->m_archive_size) {
        cdir_size = pZip->m_archive_size - cdir_ofs;
    }
`);

    if (miniz_zip_patched === miniz_zip) {
        throw new Error("Can't patch miniz_zip.c");
    }

    fs.writeFileSync("../miniz/src/miniz_zip.c", miniz_zip_patched, "utf8");

    console.info("miniz_zip.c patched");
}

async function setup_googletest() {
    console.info("googletest");
    await downloadFiles({
        srcBaseUrl: "https://github.com/google/googletest/raw/master/googletest",
        destPath: "../googletest",
        fileList: [
            "src/gtest-all.cc",
            "src/gtest.cc",
            "src/gtest-death-test.cc",
            "src/gtest-filepath.cc",
            "src/gtest-matchers.cc",
            "src/gtest-port.cc",
            "src/gtest-printers.cc",
            "src/gtest-test-part.cc",
            "src/gtest-typed-test.cc",
            "src/gtest_main.cc",
            "src/gtest-internal-inl.h",
            "include/gtest/gtest.h",
            "include/gtest/internal/gtest-internal.h",
            "include/gtest/internal/gtest-string.h",
            "include/gtest/internal/gtest-port.h",
            "include/gtest/internal/gtest-port-arch.h",
            "include/gtest/internal/gtest-filepath.h",
            "include/gtest/internal/gtest-type-util.h",
            "include/gtest/internal/gtest-param-util.h",
            "include/gtest/gtest_pred_impl.h",
            "include/gtest/internal/gtest-death-test-internal.h",
            "include/gtest/internal/custom/gtest-port.h",
            "include/gtest/internal/custom/gtest-printers.h",
            "include/gtest/internal/custom/gtest.h",
            "include/gtest/gtest-death-test.h",
            "include/gtest/gtest-matchers.h",
            "include/gtest/gtest-message.h",
            "include/gtest/gtest-param-test.h",
            "include/gtest/gtest-printers.h",
            "include/gtest/gtest_prod.h",
            "include/gtest/gtest-test-part.h",
            "include/gtest/gtest-typed-test.h",
            "include/gtest/gtest-spi.h",
        ]
    });
}

async function setup_benchmark() {
    console.info("benchmark");
    await downloadFiles({
        srcBaseUrl: "https://github.com/google/benchmark/raw/master",
        destPath: "../benchmark",
        fileList: [
            "include/benchmark/benchmark.h",
            "src/arraysize.h",
            "src/benchmark_api_internal.cc",
            "src/benchmark_api_internal.h",
            "src/benchmark_main.cc",
            "src/benchmark_name.cc",
            "src/benchmark_register.cc",
            "src/benchmark_register.h",
            "src/benchmark_runner.cc",
            "src/benchmark_runner.h",
            "src/benchmark.cc",
            "src/check.h",
            "src/colorprint.cc",
            "src/colorprint.h",
            "src/commandlineflags.cc",
            "src/commandlineflags.h",
            "src/complexity.cc",
            "src/complexity.h",
            "src/console_reporter.cc",
            "src/counter.cc",
            "src/counter.h",
            "src/csv_reporter.cc",
            "src/cycleclock.h",
            "src/internal_macros.h",
            "src/json_reporter.cc",
            "src/log.h",
            "src/mutex.h",
            "src/re.h",
            "src/reporter.cc",
            "src/sleep.cc",
            "src/sleep.h",
            "src/statistics.cc",
            "src/statistics.h",
            "src/string_util.cc",
            "src/string_util.h",
            "src/sysinfo.cc",
            "src/thread_manager.h",
            "src/thread_timer.h",
            "src/timers.cc",
            "src/timers.h",
        ]
    });
}


async function setup_tracy() {
    console.info("tracy");
    await downloadFiles({
        srcBaseUrl: "https://github.com/wolfpld/tracy/raw/master",
        destPath: "../tracy/src",
        fileList: [
            "Tracy.hpp",
            "TracyClient.cpp",
            "common/tracy_lz4.cpp",
            "common/tracy_lz4.hpp",
            "common/tracy_lz4hc.cpp",
            "common/tracy_lz4hc.hpp",
            "common/TracyAlign.hpp",
            "common/TracyAlloc.hpp",
            "common/TracyApi.h",
            "common/TracyColor.hpp",
            "common/TracyForceInline.hpp",
            "common/TracyMutex.hpp",
            "common/TracyProtocol.hpp",
            "common/TracyQueue.hpp",
            "common/TracySocket.cpp",
            "common/TracySocket.hpp",
            "common/TracySystem.cpp",
            "common/TracySystem.hpp",
        ]
    });
}

Promise.all([
    setup_imgui(),
    setup_miniaudio(),
    setup_pugixml(),
    setup_stb(),
    setup_sokol(),
    setup_sokol_shdc(),
    setup_miniz(),
    setup_googletest(),
    setup_benchmark(),
    setup_tracy(),
]).then();