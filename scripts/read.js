const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const os = require("os");

async function readDir(entry, hasFileList) {
  const list = hasFileList || [];
  const dirInfo = fs.readdirSync(entry);

  await Promise.all(
    dirInfo.map(async (item) => {
      if (list.some((i) => i.name === item)) return;

      const location = path.join(entry, item);
      const info = fs.statSync(location);

      if (!info.isDirectory()) {
        let image = "";

        const time = await new Promise((resolve, reject) => {
          try {
            const name = `${item.substring(0, item.lastIndexOf(".") - 1)}.jpg`;
            let cmd = "ffmpeg";
            if (os.platform() == "win32") {
              cmd = path.join(__dirname, "../tool.exe");
            }
            exec(
              `${cmd} -ss 00:00:10 -i "${location}" -y -f image2 -t 0.001 "screenshots/${name}"`,
              (err, stdout, stderr) => {
                resolve(
                  /Duration\: ([0-9\:\.]+),/.exec(stderr.toString())?.[1]
                );
              }
            );

            image = name;
          } catch (error) {
            resolve("");
          }
        });

        list.push({
          name: item,
          image,
          time,
          sizep: prettyBytes(info.size),
          size: info.size,
          star: 0,
        });
      }
    })
  );

  return list;
}

function prettyBytes(number) {
  const UNITS = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const isNegative = number < 0;
  const prefix = isNegative ? "-" : "";

  if (isNegative) number = -number;
  if (number < 1) return { value: prefix + number, unit: UNITS[0] };

  const exponent = Math.min(
    Math.floor(Math.log10(number) / 3),
    UNITS.length - 1
  );

  return (
    prefix +
    (number / Math.pow(1000, exponent)).toPrecision(3) +
    UNITS[exponent]
  );
}

(async () => {
  eval(
    fs
      .readFileSync("list.js", "utf-8")
      .replace("window.videoList=", "global.videoList=")
  );
  fs.writeFileSync(
    __dirname + "/../list.js",
    "window.videoList=" +
      JSON.stringify(
        await readDir(__dirname + "/../videos", global.videoList),
        null,
        2
      )
  );
})();
