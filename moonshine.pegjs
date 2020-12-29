//  Moonshine Grammar
// ==========================
//
// Accepts Namespaced, typed Steps and constants

Namespace
  = name:Name _ "{" _ values:Blocks _ "}" _ {return {name, type: 'Namespace', values}}

Blocks
  = fns:(Block _ / (Comment _))+ { return fns.map(a => a[0]) }

Name 
  = name:([a-zA-Z][_a-zA-Z]*) { name[1].unshift(name[0]); return name[1].join("") }

Block
  = Trigger / Context / Step / Value

TypedList
  = name:Name "[]" {return name + "List"}

ConstrainedTypedList
  = name:Name "[" _ len:Integer "]" {return name + "List/" + len.value}

Type
  = ConstrainedTypedList
  / TypedList
  / Name

NamedReturnType
  = name:Name _ ":" _ type:Type _ '"' returnName:Name '"' {return {name, type, returnName}}

NamedReturnUntyped
  = name:Name _ '"' returnName:Name '"' {return {name, type:null, returnName}}
  
TypedName
  = name:Name _ ":" _ type:Type {return {name,type, returnName:name}}

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
  = StepCall
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
  
Dict = "{" list:KeyValueList "}" { return {type: 'Dict', value: list} }

KeyValue
  = key:Name _ ":" _ value:Value { return {key, value} }
  
KeyValueList
  = (vals:KeyValue val:CommaSep)* KeyValue {let l = vals.map(a => a[0]); l.push(val); return l}
  
StepSignature
  = name:StepName _ params:Parameters {return {name, params}}
 
StepBody
  = "{" _ exprs:Expression+ _ "}" {return exprs }

LocalsBody
  = "{" _ "locals" _ "{" _ locals:Value+ _ "}" _ exprs:Expression+ _ "}" {return {locals, exprs}}

ValueBody
  = "<=" _ expr:Expression  { return expr }
  
Step
 = sig:StepSignature _ body:StepBody { return {type: 'Step', name: sig.name.name, returnType: sig.name.type, returnName: sig.name.returnName || sig.name.name, params: sig.params, body}}

ContextSignature
   = "context" __ name:Name _ params:Parameters {return {name, params}}

ContextBody
   = LocalsBody
   / StepBody

Context
  = sig:ContextSignature _ body:ContextBody {return {type: 'Context', name: sig.name, params: sig.params, locals: body.locals || [], body: body.exprs || body}}

TriggerSignature
  = "trigger" __ name:Name _ "(" _ ")" {return {name}}

Trigger
  = sig:TriggerSignature _ body:ContextBody {return {type: 'Trigger', name: sig.name, locals: body.locals || [], body: body.exprs || body}}

Value
  = sig:TypedName _ body:ValueBody _ ";" _ {return {type: 'Value', name: sig.name, returnType: sig.type, value: body}}
 
Expression
  = Comment
  / StepCall
  / Argument

Comment
  = "//" _ value:([^\n]*) _ { return {type: 'Comment', value: value.join('')}}
  / "/*" _ value:(.*) _ "*/" { return {type: 'Comment', value: value.join('')}}

StepCall
  = namespace:Name "." name:Name args:Arguments _ {return {type: 'StepCall', namespace, name, args}}
  
_ "whitespace"
  = [ \t\n\r]* {return undefined}

__ "mandatory whitespace"
  = [ \t]+ {return undefined}

WS "just space"
  = [ \t]*

NL "new line"
  = WS [\r\n]+ {return undefined}

