# Core formatters

# Calls a function with arguments
Rivets.public.formatters['call'] = (value, args...) ->
	value.call @, args...

