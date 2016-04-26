reciffy.factory('RecipeService', ['Restangular', '$state', '$stateParams', function(Restangular, $state, $stateParams) {
  var _recipes = {};
  var _comments = {};
  var _tags = {};
  var _units = [];
  var _ingredients = [];
  var _made_recipes = {};

  var _currents = {
    recipe: {},
    tag: {name: "", recipe_id: null},
    comment: {comment_description: "", recipe_id: null},
    disabledStatus: true,
    show_recipe_made: false,
    rating: {rating: 0, recipe_id: null},
  };

  var checkRecipeMade = function(recipe) {
    _currents.show_recipe_made = false;
    if (_made_recipes[recipe.id]) {
        _currents.show_recipe_made = true;
    }
  };

  var setOneRecipe = function(recipe_id) {
    if ( !_recipes[recipe_id] ) {
      Restangular
      .one('recipes', recipe_id)
      .get()
      .then( function(recipe) {
        _recipes[recipe.id] = recipe;
      })
    }
  };

  var setMadeRecipes = function() {
    Restangular
    .all('made_recipes')
    .getList()
    .then( function(allMadeRecipes) {
      for( var i = 0; i < allMadeRecipes.length; i++ ) {
        _made_recipes[allMadeRecipes[i].recipe_id] = allMadeRecipes[i].user_id
      }
    });
  };

  var setIngredients = function() {
    Restangular
    .all('ingredients')
    .getList()
    .then( function(ingredients) {
      _ingredients.length = 0;
      for( var i = 0; i < ingredients.length; i++ ) {
        _ingredients.push(ingredients[i]);
        // _ingredients[ingredients[i].id] = ingredients[i];
      }
    });
  };

  var setUnits = function() {
    Restangular
    .all('units')
    .getList()
    .then( function(units) {
      for( var u = 0; u < units.length; u++ ) {
         _units.push(units[u]);
        //_units[units[u].id] = units[u];
      }
    });
  };

  var newRecipe = function() {
    _currents.recipe = {};
  };

  var getRecipes = function() {
    return _recipes;
  };

  var getTags = function() {
    return _tags;
  };

  var getUnits = function() {
    return _units;
  };

  var getIngredients = function() {
    return _ingredients;
  };

  var getMadeRecipes = function() {
    return _made_recipes;
  };

  var getTag = function() {
    return _currents.tag;
  };

  var getComment = function() {
    return _currents.comment;
  };

  var getComments = function() {
    return _comments;
  };

  var addRecipe = function(recipe) {
    _recipes.push(recipe);
  };

  var _setCurrents = function(recipe_id, currentUser) {
    _currents.recipe = _recipes[recipe_id];

    _currents.disabledStatus = ( currentUser.id != _recipes[recipe_id].user_id );
     checkRecipeMade(_recipes[recipe_id])

    if (_currents.recipe.comments) {
      for ( var c = 0; c < _currents.recipe.comments.length; c++) {
        _comments[_currents.recipe.comments[c].id] = _currents.recipe.comments[c];
        _currents.comment.recipe_id = recipe_id;
      }
    }

    if (_currents.recipe.tags) {
      for ( var t = 0; t < _currents.recipe.tags.length; t++) {
        _tags[_currents.recipe.tags[t].id] = _currents.recipe.tags[t];
        _currents.tag.recipe_id = recipe_id;
      }
    }

    if ( _currents.recipe.ratings ) {
      for ( var r = 0; r < _currents.recipe.ratings.length; r++) {
        if ( _currents.recipe.ratings[r].user_id === currentUser.id ) {
          _currents.rating.rating = _currents.recipe.ratings[r].rating;
          _currents.rating.id = _currents.recipe.ratings[r].id;
          break;
        }
      }
    }

    _currents.rating.recipe_id = recipe_id;

  };

  var setCurrentRecipe = function( recipe_id, currentUser ) {
    _clearSubLists();
    if ( !!_recipes[recipe_id] ) {
      _setCurrents( recipe_id, currentUser );
    } else if (recipe_id === "new") {
      createEmptyRecipe( currentUser )
    } else {
      _requestSingleRecipe( recipe_id, currentUser )
    }
  };

  var _clearSubLists = function() {
    for (var tag in _tags) delete _tags[tag];
    for (var comment in _comments) delete _comments[comment];
    _currents.rating.rating = 0;
    _currents.rating.recipe_id = null;
    _currents.rating.id = null;
  }

  var _requestSingleRecipe = function(recipe_id, currentUser) {
    Restangular
    .one('recipes', recipe_id)
    .get()
    .then( function(recipe) {
      _recipes[recipe.id] = recipe;
      _setCurrents(recipe.id, currentUser);
      setMadeRecipes(currentUser);
    });
  };


  var addRecipe = function(recipe) {
    _recipes[recipe.id] = recipe;
  };

  var deleteRecipe = function() {
    if ( !_currents.disabledStatus ) {
      Restangular
      .one( 'recipes', _currents.recipe.id )
      .remove()
      .then( function(recipe) {
        delete _recipes[ recipe.id ];
        $state.go('reciffy.recipes.all');
      }, function(error) {
        console.error(error);
      })
    }
  };

  var getCurrentRecipe = function() {
    return _currents.recipe;
  };

  var getdisabledStatus = function() {
    return _currents.disabledStatus;
  };

  var getCurrentStuff = function() {
    return _currents;
  };

  var addComment = function() {
    Restangular
    .one("recipes", _currents.recipe.id)
    .all("comments")
    .post(_currents.comment)
    .then( function(comment) {
      console.log(comment)
      _comments[comment.id] = comment;
      _currents.comment.comment_description = "";
    });
  };

  var removeComment = function(comment) {
    Restangular
    .one("recipes", _currents.recipe.id)
    .one("comments", comment.id)
    .remove()
    .then(function(deletedComment) {
      delete _comments[deletedComment.id];
    });
  };

  var addTag = function() {
    Restangular
    .all('tags')
    .post(_currents.tag, {  taggable_id: _currents.recipe.id,
                            taggable_type: "Recipe" })
    .then( function(newTag) {
      _tags[newTag.id] = newTag;
      _currents.tag.name = "";
    });
  };

  // Actually only deletes that particular TAGGING, not the tag itself, but goes through the tag controller
  var removeTag = function(tag_id) {
    Restangular
    .one("tags", tag_id)
    .remove({ taggable_id: _currents.recipe.id,
              taggable_type: "Recipe"})
    .then(function(deletedTag) {
      delete _tags[deletedTag.id];
    });
  };

  var rateRecipe = function() {
    if ( _currents.rating.id ) {
      Restangular.one("ratings", _currents.rating.id)
      .patch({rating: _currents.rating})
      .then(function(response) {
        _currents.rating = response;
      }, function(error) {
        console.error(error);
      });
    } else {
      Restangular.all("ratings")
      .post({rating: _currents.rating})
      .then(function(response) {
        _currents.rating = response;
      }, function(error) {
        console.error(error);
      });
    }

  }

  var updateRecipe = function() {
    recipe = getCurrentRecipe()
    Restangular
     .one('recipes', recipe.id)
     .patch({recipe})
     .then(function(newRecipe) {
        // Success
    })
  };

  var makeRecipeIngredient = function() {

  };

  var addRecipeIngredient = function(recipe_ingredient) {
    recipe = getCurrentRecipe()
    recipe_ingredient["recipe_id"] = recipe.id

    var fractQuant = new Fraction( recipe_ingredient['quantity'] );
    recipe_ingredient["quantity"] = fractQuant.n / fractQuant.d;

    return Restangular.all('recipe_ingredients')
          .post(recipe_ingredient)
          .then(
             function(response)  {
               recipe.recipe_ingredients.unshift(response);
             },
             function(response)  {
               alert("Could not add recipe ingredient!");
             }
          );
    }

  var removeRecipeIngredient = function(ri) {
    Restangular
    .one("recipe_ingredients", ri.id)
    .remove()
    .then(function(deletedRecipeIngredient) {
      var length = _currents.recipe.recipe_ingredients.length
      for ( var i = 0; i < length; i++ ) {
        if ( _currents.recipe.recipe_ingredients[i]
          && deletedRecipeIngredient
          && _currents.recipe.recipe_ingredients[i].id === deletedRecipeIngredient.id ) {
          _currents.recipe.recipe_ingredients.splice(i, 1);
        }
      }
    })
  };

  var forkRecipe = function(recipe, currentUser) {
    var newRecipe = {
      name: recipe.name,
      description:  recipe.description,
      instructions: recipe.instructions,
      prep_time:    recipe.prep_time,
      cook_time:    recipe.cook_time,
      original_id:  recipe.user_id,
      user_id: currentUser.id
    };

    ingredients = recipe.recipe_ingredients;

    Restangular
    .all('recipes')
    .post(newRecipe)
    .then( function(forkedRecipe) {

      _recipes[forkedRecipe.id] = forkedRecipe;
      _setCurrents(forkedRecipe.id, currentUser );
      _recipes[forkedRecipe.id].recipe_ingredients = [];

      for(var i = 0;i < ingredients.length; i++) {
        var ri = {unit_id: ingredients[i].unit_id,
                  ingredient_id: ingredients[i].ingredient_id,
                  quantity: ingredients[i].quantity,
        }
        addRecipeIngredient(ri)
      }

       $state.go('reciffy.recipes.show', {id: forkedRecipe.id});
    });
  }

  return {
    setOneRecipe: setOneRecipe,
    getRecipes: getRecipes,
    setUnits:   setUnits,
    setMadeRecipes: setMadeRecipes,
    getUnits:   getUnits,
    getMadeRecipes: getMadeRecipes,
    setIngredients: setIngredients,
    getIngredients: getIngredients,
    setCurrentRecipe: setCurrentRecipe,
    getCurrentRecipe: getCurrentRecipe,
    addComment: addComment,
    removeComment: removeComment,
    addTag: addTag,
    removeTag: removeTag,
    getTags: getTags,
    getTag: getTag,
    getComments: getComments,
    getComment: getComment,
    getCurrentStuff: getCurrentStuff,
    getdisabledStatus: getdisabledStatus,
    rateRecipe: rateRecipe,
    updateRecipe: updateRecipe,
    removeRecipeIngredient: removeRecipeIngredient,
    makeRecipeIngredient: makeRecipeIngredient,
    addRecipeIngredient: addRecipeIngredient,
    forkRecipe: forkRecipe,
    deleteRecipe: deleteRecipe,
    addRecipe: addRecipe,
  };
}]);
