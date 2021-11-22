//  Moonshine Grammar
// ==========================
//
// Accepts Namespaced, typed Steps and constants

Unit "unit"
  = name:Name _ "[" _ values:Things _ "]" _ {return {name, type: 'Unit', values}}

Stage "stage"
  = "Stage" _ "[" _ values:Properties _ "]" _ {return {name, type: 'Stage', values}}

Library "library"
  = "Library" _ "[" _ values:Properties _ "]" _ {return {name, type: 'Library', values}}

Sprite "sprite"
  = name:Name _ "[" _ values:Properties _ "]" _ {return {name, type: 'Sprite', values}}

Things "things" // later will include non-visible objects as well
  = ( Stage / Library / Sprite / Comment )+

// Properties
//   = (Block / Form / Sound / Costume / Spritesheet / Cycle / Comment )+

// As further properties are defined, add them here
Properties "properties"
  = fns:(Block / Form / Comment )+ { return fns.map(a => a[0]) }

Blocks "blocks"
  = (Block / Comment)+

Name "name"
  = name:([a-zA-Z][ _a-zA-Z0-9]*) { name[1].unshift(name[0]); return name[1].join("") }

Block "name"
  = Trigger / Context / Step / Value

Form "form"
  = name:Name "[" _ values:KeyValueList _ "]" _ {return {name, type:'Form', values}}

TypedList "typed list"
  = name:Name "[]" {return name + "List"}

ConstrainedTypedList "constrained typed list"
  = name:Name "[" _ len:Integer "]" {return name + "List/" + len.value}

Type "type"
  = ConstrainedTypedList
  / TypedList
  / Name

NamedReturnType "named return type"
  = name:Name _ ":" _ type:Type _ '"' returnName:Name '"' {return {name, type, returnName}}

NamedReturnUntyped "named return untyped"
  = name:Name _ '"' returnName:Name '"' {return {name, type:null, returnName}}

TypedName "typed name"
  = name:Name _ ":" _ type:Type {return {name,type, returnName:name}}

StepName "step name"
  = NamedReturnType / TypedName

CommaSep "comma sep"
  = _ "," _

Parameters "parameters"
  = "(" _ ")" {return [] }
  / "(" _ a:TypedName _ ")" { return [a] }
  / "(" _ a:TypedName CommaSep b:TypedName ")" {return [a,b]}
  / "(" _ a:TypedName CommaSep b:TypedName CommaSep c:TypedName ")" { return [a,b,c] }

Arguments "arguments"
  = "(" _ ")" { return [] }
  / "(" _ a:Argument _ ")" { return [a] }
  / "(" _ a:Argument CommaSep b:Argument _ ")" { return [a,b] }
  / "(" _ a:Argument CommaSep b:Argument CommaSep c:Argument _ ")" {return [a, b, c]}

Argument "argument"
  = StepCall
  / ValueArg
  / Name

ValueArg "value arg"
  = KeyedValue
  / IndexedValue
  / LiteralValue

NamedValue "named value"
  = KeyedValue
  / Name

KeyedValue "keyed value"
  = object:Name "." key:NamedValue {return {type: "KeyedValue", object, key} }

IndexedValue "indexed array"
  = array:Name "[" _ index:ValueArg _ "]" { return {type: "IndexedValue", array, index} }

LiteralValue "literal value"
  = Number
  / Truth
  / Text
  / List
  / Dict

Number "number"
  = Float
  / Integer

Float "float"
  = [0-9]* "." [0-9]+ {return {type: 'Float', value: parseFloat(text())}}

Integer "integer"
  = [0-9]+ {return {type: 'Integer', value: parseInt(text(), 10)}}

Truth "truth"
  = "true" / "false" {return {type: 'Truth', value: text()==='true'}}

Text "text"
  = '"' .* '"' { return {type: 'Text', value: text()} }
  / "'" .* "'" { return {type: 'Text', value: text()} }

ValueList "value list"
  = vals:(Argument CommaSep)* val:Argument {let l = vals.map(a => a[0]); l.push(val); return l;}

List "list"
  = "[" list:ValueList "]" { return {type: 'List', value: list} }

Dict "dict"
  = "{" list:KeyValueList "}" { return {type: 'Dict', value: list} }

KeyValue "key value"
  = key:Name _ ":" _ value:Value { return {key, value} }

KeyValueList "key value list"
  = (vals:KeyValue val:CommaSep)* KeyValue {let l = vals.map(a => a[0]); l.push(val); return l}

StepSignature "step signature"
  = name:StepName _ params:Parameters {return {name, params}}

StepBody "step body"
  = "{" _ exprs:Expression+ _ "}" {return exprs }

LocalsBody "locals body"
  = "{" _ "locals" _ "{" _ locals:Value+ _ "}" _ exprs:Expression+ _ "}" {return {locals, exprs}}

ValueBody "value body"
  = "<=" _ expr:Expression  { return expr }

Step "step"
 = sig:StepSignature _ body:StepBody { return {type: 'Step', name: sig.name.name, returnType: sig.name.type, returnName: sig.name.returnName || sig.name.name, params: sig.params, body}}

ContextSignature "context signature"
   = "context" __ name:Name _ params:Parameters {return {name, params}}

ContextBody "context body"
   = LocalsBody
   / StepBody

Context "context"
  = sig:ContextSignature _ body:ContextBody {return {type: 'Context', name: sig.name, params: sig.params, locals: body.locals || [], body: body.exprs || body}}

TriggerSignature "trigger signature"
  = "trigger" __ name:Name _ "(" _ ")" {return {name}}

Trigger "trigger"
  = sig:TriggerSignature _ body:ContextBody {return {type: 'Trigger', name: sig.name, locals: body.locals || [], body: body.exprs || body}}

Value "value"
  = sig:TypedName _ body:ValueBody _ ";" _ {return {type: 'Value', name: sig.name, returnType: sig.type, value: body}}

Expression "expression"
  = Comment
  / StepCall
  / Argument

Comment "comment"
  = "//" _ value:([^\n]*) _ { return {type: 'Comment', value: value.join('')}}
  / "/*" _ value:(.*) _ "*/" _ { return {type: 'Comment', value: value.join('')}}

StepCall "step call"
  = namespace:Name "." name:Name args:Arguments _ {return {type: 'StepCall', namespace, name, args}}

_ "whitespace"
  = [ \t\n\r]* {return undefined}

__ "mandatory whitespace"
  = [ \t]+ {return undefined}

WS "just space"
  = [ \t]*

NL "new line"
  = WS [\r\n]+ {return undefined}

