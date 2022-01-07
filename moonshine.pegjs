//  Moonshine Grammar
// ==========================
//
// Accepts Namespaced, typed Steps and constants

// Library of useful rules

_ "optional whitespace"
  = [ \t\n\r]* {return undefined}

__ "mandatory whitespace"
  = [ \t]+ {return undefined}

WS "just space"
  = [ \t]*

NL "new line"
  = WS [\r\n]+ {return undefined}

d "digit"
  = [0-9]

D "not digit"
  = [^0-9]

w "alphanumeric"
  = [A-Za-z0-9_]

W "not alphanumeric"
  = [^A-Za-z0-9_]

s "single whitespace"
  = [ \f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]

S "not whitespace"
  = [^ \f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]

X "neither digit nor whitespace nor structure characters"
  = [^ 0-9\[\]\(\)\f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]

x "not non-space whitespace nor structure characters"
  = [^\[\]\(\)\f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]

t "horizontal tab"
  = [\t]

r "carriage return"
  = [\r]

n "newline"
  = [\n]

v "vertical tab"
  = [\v]

f "form feed"
  = [\f]



// Unit is the starting point for a Moonshine script

Unit
  = "unit" __ name:Name _ "[" _ values:Things _ "]" _ {return {name, type: 'Unit', values}}

Comment
  = _ "//" _ value:([^\n]+) _ { return {type: 'Comment', value: value.join('')}}
  / _ "/\*" _ value:(.+) _ "\*/" _ { return {type: 'Comment', value: value.join('')}}

Stage
  = "stage" _ "[" _ values:Properties _ "]" _ {return {name: 'Stage', type: 'Stage', values}}

Library
  = "library" _ "[" _ values:Properties _ "]" _ {return {name: 'Library', type: 'Library', values}}

Sprite
  = _ "sprite" __ name:Name _ "[" _ values:Properties _ "]" _ {return {name, type: 'Sprite', values}}

Things // later will include non-visible objects as well
  = ( Stage / Library / Sprite / Comment )+

// As further properties are defined, add them here
Properties
  = (TriggerCall / Form / Sounds / Costumes / Struct / BlockDef / Comment )+

Sounds
  = _ "sounds" _ "[" _ (Sound / Comment)+ _ "]"

Costumes
  = _ "costumes" _ "[" _ (Costume / Comment)+ _ "]"

Sound
  = "not defined"

Costume
  = "not defined"

Struct
  = "define struct" __ Name _ "[" (KeyValue / Comment)+ "]"

Name
  = _ name:( X x*) { name[1].unshift(name[0]); console.log( `name: ${name[1].join("").trim()}`); return name[1].join("").trim() }

BlockDef
  = TriggerDef / ContextDef / StepDef / ValueDef

Form
  = _ name:Name "[" _ values:KeyValueList _ "]" _ {return {name, type:'Form', values}}

TypedList
  = _ name:Name "[]" {return name + "List"}

ConstrainedTypedList
  = _ name:Name "[" _ len:Integer "]" {return name + "List/" + len.value}

Type
  = ConstrainedTypedList
  / TypedList
  / Name

NamedReturnType
  = name:Name _ ":" _ type:Type _ '"' returnName:Name '"' {return {name, type, returnName}}

NamedReturnUntyped
  = name:Name _ '"' returnName:Name '"' {return {name, type:null, returnName}}

TypedName
  = name:Name _ ":" _ type:Type {return {name, type, returnName:name}}

StepName
  = NamedReturnType / TypedName

CommaSep
  = _ "," _

Parameters
  = "(" _ ")" {return [] }
  / "(" _ a:TypedName _ ")" { return [a] }
  / "(" _ a:TypedName CommaSep b:TypedName ")" {return [a,b]}
  / "(" _ a:TypedName CommaSep b:TypedName CommaSep c:TypedName ")" { return [a,b,c] }

Arguments
  = "(" _ ")" { return [] }
  / "(" _ a:Argument _ ")" { return [a] }
  / "(" _ a:Argument CommaSep b:Argument _ ")" { return [a,b] }
  / "(" _ a:Argument CommaSep b:Argument CommaSep c:Argument _ ")" {return [a, b, c]}

Argument
  = ValueCall
  / ValueArg
  / Name

ValueArg
  = KeyedValue
  / IndexedValue
  / LiteralValue

NamedValue
  = KeyedValue
  / Name

KeyedValue
  = object:Name "." key:NamedValue {return {type: "KeyedValue", object, key} }

IndexedValue
  = array:Name "[" _ index:ValueArg _ "]" { return {type: "IndexedValue", array, index} }

LiteralValue
  = Number
  / Truth
  / Text
  / List
  / Dict

Number
  = Float
  / Integer

Float
  = [0-9]* "." [0-9]+ {return {type: 'Float', value: parseFloat(text())}}

Integer
  = [0-9]+ {return {type: 'Integer', value: parseInt(text(), 10)}}

Truth
  = "true" / "false" {return {type: 'Truth', value: text()==='true'}}

Text
  = '"' .* '"' { return {type: 'Text', value: text()} }
  / "'" .* "'" { return {type: 'Text', value: text()} }

ValueList
  = vals:(Argument CommaSep)* val:Argument {let l = vals.map(a => a[0]); l.push(val); return l;}

List
  = "[" list:ValueList "]" { return {type: 'List', value: list} }

Dict
  = "{" list:KeyValueList "}" { return {type: 'Dict', value: list} }

KeyValue
  = key:Name _ ":" _ value:ValueCall { return {key, value} }

KeyValueList
  = (vals:KeyValue val:CommaSep)* KeyValue {let l = vals.map(a => a[0]); l.push(val); return l}

StepSignature
  = _ "define" __ name:StepName _ params:Parameters {return {name: "define " + name, params}}

StepBody
  = "{" _ exprs:Expression+ _ "}" {return exprs }

LocalsBody
  = "{" _ "locals" _ "{" _ locals:ValueCall+ _ "}" _ exprs:Expression+ _ "}" {return {locals, exprs}}

ValueBody
  = "<=" _ expr:Expression  { return expr }

StepDef
 = sig:StepSignature _ body:StepBody { return {type: 'Step', name: sig.name.name, returnType: sig.name.type, returnName: sig.name.returnName || sig.name.name, params: sig.params, body}}

ContextSignature
   = _ "define" __ name:Name _ params:Parameters {return {name: "define " + name, params}}

ContextBody
   = LocalsBody
   / StepBody

ContextDef
  = sig:ContextSignature _ body:ContextBody {return {type: 'Context', name: sig.name, params: sig.params, locals: body.locals || [], body: body.exprs || body}}

TriggerSignature
  = _ "define" __ "when" __ name:Name _ "(" _ ")" {return {name: 'when ' + name}}

TriggerDef
  = _ sig:TriggerSignature _ body:ContextBody {return {type: 'Trigger', name: sig.name, locals: body.locals || [], body: body.exprs || body}}

ValueDef
  = sig:TypedName _ body:ValueBody _ ";" _ {return {type: 'Value', name: sig.name, returnType: sig.type, value: body}}

Expression
  = StepCall
  / ContextCall
  / ValueCall
  / Argument

FlexibleName
  = NamespacedName / UnnamespacedName

UnnamespacedName
  = name:Name {return {namespace:null, name}}

NamespacedName
  = namespace:Name "." name:Name {return {namespace, name}}

StepCall
  = fn:FlexibleName _ args:Arguments _ {return {type: 'StepCall', namespace:fn.namespace, name:fn.name, args, exprs:null}}

TriggerCall
  = _ "when" __ name:Name _ "[" _ exprs:Expression+ _ "]" _ {return {type: "TriggerCall", namespace:null, name, args:null, exprs}}

ContextCall
  = fn:FlexibleName _ args:Arguments _ "[" _ exprs:Expression+ _ "]" _ {return {type: 'ContextCall', namespace:fn.namespace, name: fn.name, args, exprs}}

ValueCall
  = fn:FlexibleName _ args:Arguments _ {return {type: "ValueCall", namespace:fn.namespace, name:fn.name, args, exprs:null}}


