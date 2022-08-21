const axios = require("axios");

function webRequest(url, header) {
  return new Promise((resolve, reject) => {
    axios.get(url, { headers: header })
      .then((res) => {
        resolve({ ok: true, content: res.data });
      })
      .catch((err) => {
        reject({ ok: false, content: err });
      });
  });
}

async function systemInfo(u_config) {
  try {
    let url = `${u_config.jellyfin_url}/System/Info`;
    let header = { 'X-MediaBrowser-Token': u_config.jellyfin_api_key };
    
    let req = await webRequest(url, header);
  
    return req;
  } catch(err) {
    return { ok: false, content: err };
  }
}

async function findUserId(u_config) {
  try {
    let users_url = `${u_config.jellyfin_url}/Users`;
    let users_header = { 'X-MediaBrowser-Token': u_config.jellyfin_api_key };
    let users_req = await webRequest(users_url, users_header);
    
    if (!users_req.ok) {
      return users_req;
    }
    
    for (let i = 0; i < users_req.content.length; i++) {
      //console.log(`User Compare: ${users_req.content[i].Name} - ${u_config.jellyfin_user_name}`);
      if (users_req.content[i].Name == u_config.jellyfin_user_name) {
        return { ok: true, content: users_req.content[i].Id };
      }
    }
    
    return { ok: false, content: "Couldn't find user on server." };
    
  } catch(err) {
    return { ok: false, content: err };
  }
  
}

async function libraryData(u_config) {
  try {
    let url = `${u_config.jellyfin_url}/Items?userId=${u_config.jellyfin_user_id}&recursive=true&fields=Path, ProviderIds, MediaSources`;
    let header = { 'X-MediaBrowser-Token': u_config.jellyfin_api_key };
    
    let lib = await webRequest(url, header);
    
    return lib;
    
  } catch(err) {
    return { ok: false, content: err };
  }
}

module.exports = {
  systemInfo,
  findUserId,
  libraryData
};
