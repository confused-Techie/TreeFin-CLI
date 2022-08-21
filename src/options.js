async function parseArgv(rawArg) {
  let obj = {
    jellyfin_api_key: '',
    jellyfin_user_name: '',
    jellyfin_user_id: '',
    jellyfin_url: '',
    verbose: false
  };
  
  // TODO Allow this to accept both arrays of CLI options, and Objects passed via functions.
  
  if (rawArg.length < 1) {
    return obj;
  }
  
  for (let i = 0; i < rawArg.length; i++) {
    if (param(rawArg[i], "--jellyfin_api_key")) {
      obj.jellyfin_api_key = rawArg[i+1];
    } else if (param(rawArg[i], "--jellyfin_user_name")) {
      obj.jellyfin_user_name = rawArg[i+1];
    } else if (param(rawArg[i], "--jellyfin_url")) {
      obj.jellyfin_url = rawArg[i+1];
    } else if (param(rawArg[i], "--jellyfin_user_id")) {
      obj.jellyfin_user_id = rawArg[i+1];
    } else if (param(rawArg[i], "--verbose") || param(rawArg[i], "-v")) {
      obj.verbose = true;
    } 
  }
  
  return obj;
}

function param(source, find) {
  // takes each value of the cli parameters, and returns true if it finds the `find` 
  // at the beggining, really just a simple way of reducing verbosity 
  try {
    if (source.startsWith(find)) {
      return true;
    } else {
      return false;
    }
  } catch(err) {
    // if for some reason whatever value passed doesn't have the `startsWith` method 
    console.log(err);
    return false;
  }
}

module.exports = { parseArgv };
