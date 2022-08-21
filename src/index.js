
const { parseArgv } = require("./options.js");
const api = require("./api.js");

const global_config = {
  upload_url: "https://localhost:8080"
};

let user_config;

async function main(args) {
  output(1, "Starting TreeFin...");
  
  user_config = await parseArgv(args);
  
  output(2, user_config);
  
  // now lets check that all required values are available.
  await requiredConfigCheck();
  output(2, "Confirmed all Required Parameters are available.");
  
  output(2, "Retreiving Jellyfin System Information.");
  let system_info = await api.systemInfo(user_config);
  
  if (!system_info.ok) {
    output(0, system_info.content);
    process.exit(1);
  }
  output(2, "Successfully retrieved Jellyfin System Information.");
  
  if (user_config.jellyfin_user_id.length < 1) {
    // if the user id is not set, but we know one is valid from the requiredConfigCheck, 
    // then we need to get the user id 
    output(2, "Missing User ID, attempting to find...");
    let tmpid = await api.findUserId(user_config);
    
    if (!tmpid.ok) {
      output(0, tmpid.content);
      process.exit(1);
    }
    
    user_config.jellyfin_user_id = tmpid.content;
    output(2, "Successfully found User ID.");
  }
  
  if (user_config.jellyfin_user_id.length > 1) {
    output(2, "Collecting Media Data.");
    let data = await api.libraryData(user_config);
    
    if (!data.ok) {
      output(0, data.content);
      process.exit(1);
    }
    
    // final steps.
    
    // now we want to take our system data and data from the server, and concat it all together in the proper schema.
    
    let schema = await mergeData(system_info.content, data.content);
    
    if (!schema.ok) {
      output(0, schema.content);
      process.exit(1);
    }
    output(2, "Successfully Parsed Media Data.");
    
    // upload. 
    console.log(schema.content);
    
  } else {
    // the id should be set by now. So we will have to exit without it.
    output(0, "Expected to have jellyfin_user_id at this point. Stopping without it...");
    process.exit(1);
  }
}

function output(lvl, data) {
  // Way to log data, while using proper verbosity levels. Even if simplified 
  // 0 = ALL 
  // 1 = WARN 
  // 2 = VERBOSE 
  switch(lvl) {
    case(0):
      console.log(data);
      break;
    case(1):
      console.error(data);
      break;
    case(2):
      if (user_config.verbose) {
        console.log(data);
      }
      break;
  }
}

async function mergeData(system, data) {
  try {
    let obj = {
      user_token: '',
      system: {
        os: system.OperatingSystem,
        architecture: system.SystemArchitecture,
        version: system.Version,
        plugins: []
      },
      media: []
    };
    
    // now to create the plugins 
    
    for (let i = 0; i < system.CompletedInstallations.length; i++) {
      obj.system.plugins.push({
        name: system.CompletedInstallations[i].Name,
        version: system.CompletedInstallations[i].Version
      });
    }
    
    // now to create the media section 
    
    for (let i = 0; i < data.Items.length; i++) {
      obj.media.push({
        name: data.Items[i].Name,
        ids: data.Items[i].ProviderIds,
        path: data.Items[i].Path,
        metadata: {
          location_type: data.Items[i].LocationType,
          media_type: data.Items[i].MediaType,
          item_type: data.Items[i].Type,
          media_sources: data.Items[i].MediaSources 
        }
      });
    }
    
    return { ok: true, content: obj };
    
  } catch(err) {
    return { ok: false, content: err };
  }
}

async function requiredConfigCheck() {
  const badConfig = function(item) {
    console.log(`Missing Required Item from Configuration: ${item}`);
    process.exit(1);
  };
  
  if (global_config.upload_url > 1) {
    badConfig("global_config.upload_url");
  } else if (user_config.jellyfin_api_key > 1) {
    badConfig("user_config.jellyfin_api_key");
  } else if (user_config.jellyfin_user_name > 1 && user_config.jellyfin_user_id > 1) {
    badConfig("user_config.jellyfin_user_name || user_config.jellyfin_user_id");
  } else if (user_config.jellyfin_url > 1) {
    badConfig("user_config.jellyfin_url");
  }
}

module.exports = {
  main
};
