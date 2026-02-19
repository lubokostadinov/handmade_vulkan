#version 450

layout(binding = 0) uniform uniform_buffer
{
    mat4 ModelMatrix;
    mat4 ViewMatrix;
    mat4 ProjectionMatrix;
    vec4 LightPosition;
    vec4 LightColor;
    vec4 CameraPosition;
} UniformBuffer;

layout(location = 0) in vec3 Position;
layout(location = 1) in vec3 Color;
layout(location = 2) in vec3 Normal;
layout(location = 3) in vec2 TextureCoordinate;

layout(location = 0) out vec3 FragmentWorldPosistion;
layout(location = 1) out vec3 FragmentNormal;
layout(location = 2) out vec2 FragmentTextureCoordinate;

void main()
{
    vec4 WorldPosition = UniformBuffer.ModelMatrix * vec4(Position, 1.0);
    gl_Position = UniformBuffer.ProjectionMatrix * UniformBuffer.ViewMatrix * WorldPosition;
    FragmentWorldPosistion = WorldPosition.xyz;
    FragmentNormal = mat3(transpose(inverse(UniformBuffer.ModelMatrix))) * Normal;
    FragmentTextureCoordinate = TextureCoordinate;
}
