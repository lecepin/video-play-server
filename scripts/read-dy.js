const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const os = require("os");

async function readDir(entry) {
  const list = [];
  const dirInfo = fs.readdirSync(entry);

  await Promise.all(
    dirInfo.map(async (item, id) => {
      const location = path.join(entry, item);
      const info = fs.statSync(location);

      if (!info.isDirectory()) {
        let image = "";

        await new Promise((resolve, reject) => {
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
          id,
          path: "videos/" + item,
          title: item,
          poster: "screenshots/" + image,
        });
      }
    })
  );

  return list;
}

(async () => {
  fs.writeFileSync(
    __dirname + "/../playlist.json",
    JSON.stringify(await readDir(__dirname + "/../videos"), null, 2)
  );
})();
