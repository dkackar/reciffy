Recipe.delete_all
Ingredient.delete_all
Unit.delete_all
RecipeIngredient.delete_all
Tag.delete_all
Tagging.delete_all
User.delete_all

puts "Creating Users"

test_user = User.create(  email: "foo@bar.com",
                          password: "foo1bar2" )

10.times do |num|
  User.create(email: "user#{num}@gmail.com",
		      password: "foo1bar2")
end

puts "Creating Ingredients"

ingredients = ["cauliflower", "sugar", "spinach", "salt", "pepper", "green chilly",
               "flour","baking powder","eggs"]
ingredients.each do |element|
  Ingredient.create(name: element)
end

puts "Creating Units"

units = ["cup" ,"oz", "lbs", "grams", "tbsp", "tsp", "count"]
units.each do |element|
 Unit.create(unit_type: element)
end

puts "Creating Recipes"

10.times do
  Recipe.create(  name: Faker::Hipster.words.join(" ").titleize,
                  description: Faker::Hipster.sentence,
                  instructions: Faker::Hipster.paragraph,
                  prep_time: Random.rand(60),
                  cook_time: Random.rand(60),
                  user_id: User.all.sample.id )
end

Recipe.all.each do |r|
  5.times do
    r.recipe_ingredients.create(
      ingredient_id: Ingredient.all.sample.id,
      unit_id: Unit.all.sample.id,
      quantity: Random.rand(4)
    )
  end
end

puts "Creating Tags"
10.times do
  Tag.create( name: Faker::Hipster.word )
end

puts "Creating Taggings"

User.all.each do |u|
  2.times do
    Tagging.create( tag_id: Tag.all.sample,
                    taggable_id: u.profile.id,
                    taggable_type: "Profile" )
  end
end

Recipe.all.each do |r|
  3.times do
    Tagging.create( tag_id: Tag.all.sample,
                    taggable_id: r.id,
                    taggable_type: "Recipe" )
  end
end
