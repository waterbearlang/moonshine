//  Moonshine Grammar
// ==========================
//
// Accepts Namespaced, typed functions and constants

Namespace
  = name:Name _ "{" _ values:Functions _ "}" {return {name, type: 'namespace', values}};
  
Functions
  = ((Function _) / (Comment _))+ ;

Name 
  = name:[a-zA-Z]* { return name.join(""); };

Type
  = Name;

TypedName
  = name:Name ":" type:Type {return {name,type}};
  
CommaSep
  = _ "," _;

FunctionParameters
  = "()"
  / "(" _ TypedName _ ")"
  / "(" _ TypedName CommaSep TypedName ")"
  / "(" _ TypedName CommaSep TypedName CommaSep TypedName ")"
  ;
  
Arguments
 = "()"
 / "(" _ Argument _ ")"
 / "(" _ Argument CommaSep Argument _ ")"
 / "(" _ Argument CommaSep Argument CommaSep Argument _ ")";
 
Argument
  = Name
  / Value;

Value
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
  = (Value CommaSep)* Value;

Array
  = "[" ValueList "]";
  
Dict = "{" KeyValueList "}";

KeyValue
  = Name _ ":" _ Value;
  
KeyValueList
  = (KeyValue CommaSep)* KeyValue;
  
FunctionSignature
  = name:TypedName _ "=" _ params:FunctionParameters {return {name, params}}
  
FunctionBody
  = "{" _ exprs:Expression+ _ "}" {return "{\n" + exprs.join('\n') + "\n}"};
  
Function
 = sig: FunctionSignature _ "=>" _ body:FunctionBody { return {type: 'function', name: sig.name.name, returnType: sig.name.type, params: sig.params, body}}
 
Expression
  = Comment
  / FunctionCall;

Comment
  = "//" [^\n]*  { return {type: 'comment', value: text()}}
  / "/*" .* "*/" { return {type: 'comment', value: text()}}

FunctionCall
  = namespace:Name "." name:Name args:Arguments ";" {return {type: 'functionCall', namespace, name, args}};
  
_ "whitespace"
  = [ \t\n\r]* {return undefined};