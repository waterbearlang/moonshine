//  Moonshine Grammar
// ==========================
//
// Accepts Namespaced, typed functions and constants

Namespace
  = name:Name _ "{" _ values:Functions _ "}" {console.log('ns values: %s', JSON.stringify(values, null, 2)); return {name, type: 'namespace', values}};
  
Functions
  = fns:((Function _) / (Comment _))+ { return fns.map(a => a[0]) }

Name 
  = name:([a-zA-Z][_a-zA-Z]*) { name[1].unshift(name[0]); return name[1].join("") };

Type
  = Name;

TypedName
  = name:Name ":" type:Type {return {name,type}};
  
CommaSep
  = _ "," _;

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
  = FunctionCall
  / Value
  / Name

Value
  = KeyedValue
  / IndexedValue
  / LiteralValue

KeyedValue
  = object:Name "." key:Name {return {type: "keyedValue", object, key} }

IndexedValue
  = array:Name "[" _ index:Value _ "]" { return {type: "indexedValue", array, index} }

LiteralValue
  = Number
  / Boolean
  / String
  / Array
  / Dict;
  
Number
  = Float
  / Integer;
  
Float
  = [0-9]* "." [0-9]+ {return {type: 'float', value: parseFloat(text())}};
  
Integer
  = [0-9]+ {return {type: 'integer', value: parseInt(text(), 10)}};
  
Boolean
  = "true" / "false" {return {type: 'boolean', value: text()==='true'}}
  
String
  = '"' .* '"' { return {type: 'string', value: text()} }
  / "'" .* "'" { return {type: 'string', value: text()} }

ValueList
  = vals:(Value CommaSep)* val:Value {let l = vals.map(a => a[0]); l.push(val); return l;}

Array
  = "[" list:ValueList "]" { return {type: 'array', value: list} }
  
Dict = "{" list:KeyValueList "}" { return {type: 'dict', value: list} }

KeyValue
  = key:Name _ ":" _ value:Value { return {key, value} } 
  
KeyValueList
  = (vals:KeyValue val:CommaSep)* KeyValue {let l = vals.map(a => a[0]); l.push(val); return l};
  
FunctionSignature
  = name:TypedName _ "=" _ params:Parameters {return {name, params}}
  
FunctionBody
  = "{" _ exprs:Expression+ _ "}" {return exprs };
  
Function
 = sig: FunctionSignature _ "=>" _ body:FunctionBody { return {type: 'function', name: sig.name.name, returnType: sig.name.type, params: sig.params, body}}
 
Expression
  = Comment
  / FunctionCall;

Comment
  = "//" _ value:([^\n]*)  { return {type: 'comment', value: value.join('')}}
  / "/*" _ value:(.*) _ "*/" { return {type: 'comment', value: value.join('')}}

FunctionCall
  = namespace:Name "." name:Name args:Arguments {return {type: 'functionCall', namespace, name, args}};
  
_ "whitespace"
  = [ \t\n\r]* {return undefined};