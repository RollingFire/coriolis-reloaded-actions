const EFFECTS = {
  fastAction: "fastAction",
  skipFastAction: "skipFastAction",
  slowAction: "slowAction",
  skipSlowAction: "skipSlowAction",
}

Hooks.once('ready', function () {
  CONFIG.statusEffects.push(
    {
      "id": EFFECTS.fastAction,
      "label": "Fast Action",
      "icon": "modules/alien-actions/assets/fastaction.svg"
    },
    {
      "id": EFFECTS.skipFastAction,
      "label": "Skip Fast Action",
      "icon": "modules/alien-actions/assets/skipfastaction.svg"
    },
    {
      "id": EFFECTS.slowAction,
      "label": "Slow Action",
      "icon": "modules/alien-actions/assets/slowaction.svg"
    },
    {
      "id": EFFECTS.skipSlowAction,
      "label": "Skip Slow Action",
      "icon": "modules/alien-actions/assets/skipslowaction.svg"
    }
  );

  // We put setting selector
  // Define a new setting which can be stored and retrieved
  game.settings.register("alien-actions", "mode", {
    name: "Select where the actions will reset",
    hint: "",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "round": "Round Start",
      "turn": "When Turn Arrives"
    },
    default: "turn",
  });

});

Hooks.on('updateCombat', function (e) {
  if (game.user.isGM) {
    if (game.settings.get("alien-actions", "mode") == "round") {
      let combat_token = canvas.tokens.get(e.current.tokenId);
      let combat_actor = combat_token.actor;
      if (e.current.turn == 0) { // if we are in first turn
        // WE ACTIVATE ALL CANVAS TOKENS!
        canvas.tokens.children[0].children.forEach(token => removeAllActions(token));
      }

      else {
        // IF it's a creature with speed > 1 and we are not in first round we activate token again.
        if (combat_actor.type == "creature") { // if its a creature
          if (combat_actor.data.data.attributes.speed.value > 1) {
            removeActions(combat_token);
          }
        }
      }
    }
    else if (game.settings.get("alien-actions", "mode") == "turn") {
      let combat_token = canvas.tokens.get(e.current.tokenId)
      canvas.tokens.children[0].children.filter(token => token.data.name == combat_token.name).forEach(token => removeActions(token))
    }
  }
})



// Clear actions when combat ends.
Hooks.on('deleteCombat', async function (e) {
  canvas.tokens.children[0].children.forEach(token => removeAllActions(token))
})

async function removeAllActions(token) {
  _setEffect(token, EFFECTS.fastAction, false)
  _setEffect(token, EFFECTS.skipFastAction, false)
  _setEffect(token, EFFECTS.slowAction, false)
  _setEffect(token, EFFECTS.skipSlowAction, false)
}

async function removeActions(token) {
  //Reset fast action
  if (_hasEffect(token, EFFECTS.skipFastAction)) {
    if (!_hasEffect(token, EFFECTS.fastAction)) {
      _setEffect(token, EFFECTS.fastAction, true)
    }
    _setEffect(token, EFFECTS.skipFastAction, false)
  } else {
    _setEffect(token, EFFECTS.fastAction, false)
  }

  //Reset slow action
  if (_hasEffect(token, EFFECTS.skipSlowAction)) {
    if (!_hasEffect(token, EFFECTS.slowAction)) {
      _setEffect(token, EFFECTS.slowAction, true)
    }
    _setEffect(token, EFFECTS.skipSlowAction, false)
  } else {
    _setEffect(token, EFFECTS.slowAction, false)
  }
}

function _hasEffect(token, effectId) {
  effect = token.actor.effects.find(eff => eff.getFlag("core", "statusId").includes(effectId))
  return effect != null & effect != undefined
}

function _setEffect(token, effectId, state) {
  token.toggleEffect(CONFIG.statusEffects.find(eff => eff.id.includes(effectId)), { active: state })
}
