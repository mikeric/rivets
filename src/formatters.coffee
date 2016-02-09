# Core formatters for function handling

# Calls a function with arguments
Rivets.public.formatters['call'] = (value, args...) ->
	value.call @, args...

