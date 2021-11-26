Unit "unit"
  = name:Name _ "[" _ values:Things _ "]" _ {return {name, type: 'Unit', values}}

Comment "comment"
  = "//" _ value:([^\n]+) _ { return {type: 'Comment', value: value.join('')}}
  / "/\*" _ value:(.+) _ "\*/" _ { return {type: 'Comment', value: value.join('')}}

Sprite
  = name:Name _ "[" _ values:Properties _ "]" _ {return {name, type: 'Sprite', values}}

Things
  = (Sprite)+

Properties
  = fns:(Block / Comment )+ { return fns.map(a => a[0]) }

Block
  = Trigger / Context / Step / Value

SigBlock
  = part1:NamePart "(" _ v1:Value _ ")" part2:NamePart "(" _ v2:Value _ ")" part3:NamePart "(" _ v3:Value _ ")" part4:NamePart? {return {signature: `${part1}()${part2}()${part3}()${part4}`, values: [v1, v2, v3] } }
  / part1:NamePart "(" _ v1:Value _ ")" part2:NamePart "(" _ v2:Value _ ")" part3:NamePart? {return {signature: `${part1}()${part2}()${part3}`, values: [v1, v2] } }
  / part1:NamePart "(" _ v1:Value _ ")" part2:NamePart? {return {signature: `${part1}()${part2}`, values: [v1] } }
  / part1:NamePart {return {signature: `${part1}`, values: [] } }

NamePart
  = fns:([ _a-zA-Z0-9])+ {return fns.map(a => a[0]) }

Value
  = Literal
  / NamePart

Literal
  = Integer
  / Float
  / Text
  / List
  / 

Trigger
  = "when" _ sig:SigBlock _
