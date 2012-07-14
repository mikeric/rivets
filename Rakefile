require 'rubygems'

BUILD_DIRECTORY = 'lib'
SRC_DIRECTORY = 'src'

desc "build the toast-min.js files for distribution"
task :default => :clean do
  FileUtils.mkdir_p(BUILD_DIRECTORY)
  compile_js
end

task :build => :default

desc "removes the build directory"
task :clean do
  print_action('Removing existing build directory') do
    FileUtils.rm_rf(BUILD_DIRECTORY)
  end
end

def compile_js()
  require 'coffee-script'
  require 'closure-compiler'

  source = File.read(File.join(SRC_DIRECTORY, 'rivets.coffee'))
  FileUtils.mkdir_p(BUILD_DIRECTORY)
  output = File.join(BUILD_DIRECTORY, 'rivets.js')
  minified_output = File.join(BUILD_DIRECTORY, 'rivets-min.js')

  compiled = ''
  print_action("Compiling CoffeeScript to '#{output}'") do
    File.open(output, 'w+') do |file|
      compiled = CoffeeScript.compile(source)
      file.write(compiled)
    end
  end

  print_action("Minifying Javascript to '#{minified_output}'") do
    File.open(minified_output, 'w+') do |file|
      file.write(Closure::Compiler.new.compress(compiled))
    end
  end
end

def print_action(action, &block)
  print "#{action}... "
  STDOUT.flush

  if block.call()
    puts 'done'
  else
    puts 'failed'
  end
end
